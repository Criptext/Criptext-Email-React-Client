/*global libsignal util*/
import {
  errors,
  findKeyBundles,
  objectUtils,
  postEmail
} from './../utils/electronInterface';
import { getSessionRecordByRecipientIds } from './../utils/ipc';
import SignalProtocolStore from './store';
import { CustomError } from './../utils/CustomError';
import {
  AesEncrypt,
  generateKeyAndIv,
  base64ToWordArray,
  wordArrayToByteArray,
  wordArrayToBase64,
  byteArrayToWordArray
} from '../utils/AESUtils';
import { parseRateLimitBlockingTime } from './../utils/TimeUtils';

const KeyHelper = libsignal.KeyHelper;
const store = new SignalProtocolStore();

const getKeyBundlesOfRecipients = async (recipients, knownAddresses) => {
  const res = await findKeyBundles({
    recipients,
    knownAddresses
  });
  if (res.status !== 200) {
    return new Array(recipients.length).fill(null);
  }
  return res.body;
};

const encryptText = async (
  recipientId,
  deviceId,
  textMessage,
  arrayBufferKey
) => {
  const addressTo = new libsignal.SignalProtocolAddress(recipientId, deviceId);
  if (arrayBufferKey) {
    const sessionBuilder = new libsignal.SessionBuilder(store, addressTo);
    await sessionBuilder.processPreKey(arrayBufferKey);
  }
  const sessionCipher = new libsignal.SessionCipher(store, addressTo);
  const ciphertext = await sessionCipher.encrypt(textMessage);
  const body = util.toBase64(util.toArrayBuffer(ciphertext.body));
  return { body, type: ciphertext.type };
};

const keysToArrayBuffer = keys => {
  let preKey = undefined;
  if (keys.preKey) {
    preKey = {
      keyId: keys.preKey.id,
      publicKey: util.toArrayBufferFromBase64(keys.preKey.publicKey)
    };
  }
  return {
    identityKey: util.toArrayBufferFromBase64(keys.identityPublicKey),
    preKey,
    registrationId: keys.registrationId,
    signedPreKey: {
      keyId: keys.signedPreKeyId,
      publicKey: util.toArrayBufferFromBase64(keys.signedPreKeyPublic),
      signature: util.toArrayBufferFromBase64(keys.signedPreKeySignature)
    }
  };
};

const createEmails = async (
  body,
  recipients,
  knownAddresses,
  keyBundleJSONbyRecipientIdAndDeviceId,
  peer,
  fileKeyParams
) => {
  let result = [];
  for (const recipient of recipients) {
    const { recipientId, type } = recipient;
    const knownDeviceIds = knownAddresses[recipientId] || [];
    const deviceIdWithKeys = keyBundleJSONbyRecipientIdAndDeviceId[recipientId]
      ? Object.keys(keyBundleJSONbyRecipientIdAndDeviceId[recipientId]).map(
          deviceId => {
            return keyBundleJSONbyRecipientIdAndDeviceId[recipientId][deviceId];
          }
        )
      : [];
    const deviceIds = [...knownDeviceIds, ...deviceIdWithKeys];
    const criptextEmail = await Promise.all(
      deviceIds
        .filter(item => {
          const deviceId = typeof item === 'number' ? item : item.deviceId;
          return !(
            peer.recipientId === recipientId &&
            peer.deviceId === deviceId &&
            type === 'peer'
          );
        })
        .map(async item => {
          const deviceId = typeof item === 'number' ? item : item.deviceId;
          const keyBundleArrayBuffer =
            typeof item === 'object' ? keysToArrayBuffer(item) : undefined;
          const textEncrypted = await encryptText(
            recipientId,
            deviceId,
            body,
            keyBundleArrayBuffer
          );

          const fileKey = fileKeyParams
            ? await encryptText(
                recipientId,
                deviceId,
                `${fileKeyParams.key}:${fileKeyParams.iv}`
              )
            : null;
          let criptextEmail = {
            type,
            recipientId,
            deviceId,
            body: textEncrypted.body,
            messageType: textEncrypted.type
          };
          if (fileKey) {
            criptextEmail = { ...criptextEmail, fileKey: fileKey.body };
          }
          return criptextEmail;
        })
    );
    result = [...result, ...criptextEmail];
  }

  return result;
};

const encryptPostEmail = async ({
  recipients,
  externalRecipients,
  body,
  subject,
  threadId,
  files,
  peer,
  externalEmailPassword,
  key,
  iv
}) => {
  const recipientIds = recipients.map(item => item.recipientId);
  const isSendToMySelf =
    recipients.findIndex(item => {
      return item.recipientId === peer.recipientId && item.type !== peer.type;
    }) === -1
      ? false
      : true;
  const sessions = await getSessionRecordByRecipientIds(recipientIds);
  const knownAddresses = sessions.reduce((result, item) => {
    if (!item.recipientId) {
      return result;
    }
    return {
      ...result,
      [item.recipientId]: item.deviceIds.split(',').map(Number)
    };
  }, {});
  const keyBundles = await getKeyBundlesOfRecipients(
    recipientIds,
    knownAddresses
  );
  if (keyBundles.includes(null)) {
    throw new CustomError(errors.server.UNAUTHORIZED);
  }

  const recipientsToSendAmount =
    recipientIds.length + (isSendToMySelf ? -1 : 0);
  const recipientDevicesAmount = sessions.length + keyBundles.length;

  if (
    !(recipientsToSendAmount <= recipientDevicesAmount) ||
    recipientDevicesAmount === 0
  ) {
    throw new CustomError(errors.message.NON_EXISTING_USERS);
  }
  const keyBundleJSONbyRecipientIdAndDeviceId = keyBundles.reduce(
    (result, keyBundle) => {
      const recipientId = keyBundle.recipientId;
      const deviceId = keyBundle.deviceId;
      const recipientKeys = result[recipientId] || {};
      const item = { ...recipientKeys, [deviceId]: keyBundle };
      return { ...result, [recipientId]: item };
    },
    {}
  );
  const fileKeyParams = files && key && iv ? { key, iv } : null;

  const criptextEmails = await createEmails(
    body,
    recipients,
    knownAddresses,
    keyBundleJSONbyRecipientIdAndDeviceId,
    peer,
    fileKeyParams
  );

  const externalFileKey = `${key}:${iv}`;
  const { session, encryptedBody } = externalEmailPassword.length
    ? await encryptExternalEmail({
        body,
        externalEmailPassword,
        fileKey: externalFileKey
      })
    : { session: null, encryptedBody: null };

  const allExternalRecipients = [
    ...externalRecipients.to,
    ...externalRecipients.cc,
    ...externalRecipients.bcc
  ];
  const hasExternalRecipients = allExternalRecipients.length > 0;

  const guestEmail = hasExternalRecipients
    ? objectUtils.noNulls({
        to: externalRecipients.to,
        cc: externalRecipients.cc,
        bcc: externalRecipients.bcc,
        body: session ? encryptedBody : body,
        session,
        fileKey: session ? null : externalFileKey
      })
    : null;

  const data = objectUtils.noNulls({
    guestEmail,
    criptextEmails,
    subject,
    threadId,
    files
  });
  const res = await postEmail(data);
  if (res.status === 429) {
    const seconds = res.headers['retry-after'];
    const tooManyRequestErrorMessage = { ...errors.login.TOO_MANY_REQUESTS };
    tooManyRequestErrorMessage['description'] += parseRateLimitBlockingTime(
      seconds
    );
    throw new CustomError(tooManyRequestErrorMessage);
  } else if (res.status !== 200) {
    throw new CustomError({
      name: errors.message.ENCRYPTING.name,
      description:
        errors.message.ENCRYPTING.description + `${res.status || 'Unknown'}`
    });
  }
  return res;
};

const createDummyKeyBundle = async fileKey => {
  const preKeyId = 1;
  const signedPreKeyId = 1;
  const { identityKey, registrationId } = await generateIdentity();
  const { preKey, signedPreKey } = await generatePreKeyBundle({
    identityKey,
    signedPreKeyId,
    preKeyId
  });

  const sessionParams = {
    identityKey,
    registrationId,
    preKey,
    signedPreKey
  };
  const dummySession = {
    fileKey,
    identityKey: {
      publicKey: util.toBase64(identityKey.pubKey),
      privateKey: util.toBase64(identityKey.privKey)
    },
    registrationId,
    preKey: {
      keyId: preKey.keyId,
      publicKey: util.toBase64(preKey.keyPair.pubKey),
      privateKey: util.toBase64(preKey.keyPair.privKey)
    },
    signedPreKey: {
      keyId: signedPreKey.keyId,
      publicKey: util.toBase64(signedPreKey.keyPair.pubKey),
      privateKey: util.toBase64(signedPreKey.keyPair.privKey)
    }
  };
  return { dummySession, sessionParams };
};

const generateIdentity = () => {
  return Promise.all([
    KeyHelper.generateIdentityKeyPair(),
    KeyHelper.generateRegistrationId()
  ]).then(result => {
    const identityKey = result[0];
    const registrationId = result[1];
    return { identityKey, registrationId };
  });
};

const generatePreKeyBundle = async ({
  identityKey,
  signedPreKeyId,
  preKeyId
}) => {
  const preKey = await KeyHelper.generatePreKey(preKeyId);
  const signedPreKey = await KeyHelper.generateSignedPreKey(
    identityKey,
    signedPreKeyId
  );
  return { preKey, signedPreKey };
};

const encryptExternalEmail = async ({
  body,
  externalEmailPassword,
  fileKey
}) => {
  const recipient = externalEmailPassword;
  const deviceId = 1;
  const { dummySession, sessionParams } = await createDummyKeyBundle(fileKey);
  const keys = {
    preKey: {
      id: sessionParams.preKey.keyId,
      publicKey: sessionParams.preKey.keyPair.pubKey
    },
    identityPublicKey: sessionParams.identityKey.pubKey,
    registrationId: sessionParams.registrationId,
    signedPreKeyId: sessionParams.signedPreKey.keyId,
    signedPreKeyPublic: sessionParams.signedPreKey.keyPair.pubKey,
    signedPreKeySignature: sessionParams.signedPreKey.signature
  };
  const keyBundleArrayBuffer = await keysToArrayBuffer(keys);

  const encryptedBody = await encryptText(
    recipient,
    deviceId,
    body,
    keyBundleArrayBuffer
  );

  const saltLength = 8;
  const { key, iv, salt } = generateKeyAndIv(externalEmailPassword, saltLength);
  const saltWArray = base64ToWordArray(salt);
  const ivWArray = base64ToWordArray(iv);
  const keyWArray = base64ToWordArray(key);

  const dummySessionString = JSON.stringify(dummySession);
  const encryptedSessionWArray = AesEncrypt(
    dummySessionString,
    keyWArray,
    ivWArray
  );
  const saltBArray = wordArrayToByteArray(saltWArray);
  const ivBArray = wordArrayToByteArray(ivWArray);
  const encryptedSessionBArray = wordArrayToByteArray(encryptedSessionWArray);
  const sessionByteArray = saltBArray.concat(
    ivBArray.concat(encryptedSessionBArray)
  );

  const sessionWordArray = byteArrayToWordArray(sessionByteArray);
  const session = wordArrayToBase64(sessionWordArray);
  return {
    session,
    encryptedBody: encryptedBody.body
  };
};

export default {
  encryptPostEmail
};
