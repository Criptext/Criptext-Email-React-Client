/*global libsignal util*/
import {
  findKeyBundles,
  getSessionRecordByRecipientIds,
  postEmail
} from './../utils/ipc';
import SignalProtocolStore from './store';
import { CustomError } from './../utils/CustomError';
import { generateKeyAndIv, encryptDummySession } from '../utils/AESUtils';
import { parseRateLimitBlockingTime } from './../utils/TimeUtils';
import { noNulls } from './../utils/ObjectUtils';
import {
  createObjectRecipientDomainIdByDevices,
  filterRecipientsByBlacklisted
} from './../utils/EncryptionUtils';
import string from './../lang';
import { appDomain } from '../utils/const';

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
  preview,
  recipients,
  knownAddresses,
  keyBundleJSONbyRecipientIdAndDeviceId,
  guestDomains,
  peer,
  files
) => {
  const criptextEmailsByRecipientId = {};

  for (const recipient of recipients) {
    const { recipientId, type, domain } = recipient;

    if (guestDomains.indexOf(domain) > -1) {
      continue;
    }

    if (!criptextEmailsByRecipientId[recipientId]) {
      criptextEmailsByRecipientId[recipientId] = {
        username: recipientId,
        emails: []
      };
    }

    const knownDeviceIds = knownAddresses[recipientId] || [];
    const deviceIdWithKeys = keyBundleJSONbyRecipientIdAndDeviceId[recipientId]
      ? Object.keys(keyBundleJSONbyRecipientIdAndDeviceId[recipientId]).map(
          deviceId => {
            return keyBundleJSONbyRecipientIdAndDeviceId[recipientId][deviceId];
          }
        )
      : [];
    const deviceIds = [...knownDeviceIds, ...deviceIdWithKeys];
    await Promise.all(
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
          const bodyEncrypted = await encryptText(
            recipientId,
            deviceId,
            body,
            keyBundleArrayBuffer
          );
          const previewEncripted = await encryptText(
            recipientId,
            deviceId,
            preview
          );
          const fileKeys = files
            ? await Promise.all(
                files.map(async file => {
                  if (!file.key || !file.iv) {
                    return null;
                  }
                  const fileKey = await encryptText(
                    recipientId,
                    deviceId,
                    `${file.key}:${file.iv}`
                  );
                  return fileKey.body;
                })
              )
            : null;
          const existingFileKeys = fileKeys
            ? fileKeys.filter(fileKey => fileKey !== null)
            : [];
          const fileKey =
            existingFileKeys.length > 0 ? existingFileKeys[0] : null;

          let criptextEmail = {
            recipientId,
            domain,
            deviceId,
            type,
            body: bodyEncrypted.body,
            messageType: bodyEncrypted.type,
            preview: previewEncripted.body,
            previewMessageType: previewEncripted.type
          };
          if (fileKey) {
            criptextEmail = { ...criptextEmail, fileKey: fileKey, fileKeys };
          }
          criptextEmailsByRecipientId[recipientId]['emails'].push(
            criptextEmail
          );
          return criptextEmail;
        })
    );
  }
  return Object.values(criptextEmailsByRecipientId);
};

const encryptPostEmail = async ({
  recipientDomains,
  body,
  preview,
  subject,
  threadId,
  files,
  peer,
  externalEmailPassword
}) => {
  const recipientIds = recipientDomains.map(item => item.recipientId);
  const sessions = await getSessionRecordByRecipientIds(recipientIds);
  let knownAddresses = createObjectRecipientDomainIdByDevices(
    sessions,
    recipientDomains,
    appDomain
  );
  const {
    keyBundles,
    blacklistedKnownDevices,
    guestDomains
  } = await getKeyBundlesOfRecipients(recipientIds, knownAddresses);
  if (keyBundles.includes(null)) {
    throw new CustomError(string.errors.unauthorized);
  }
  if (blacklistedKnownDevices.length) {
    const {
      knownAddressesFiltered,
      sessionIdentifiersToDelete
    } = filterRecipientsByBlacklisted(
      blacklistedKnownDevices,
      knownAddresses,
      appDomain
    );
    knownAddresses = knownAddressesFiltered;
    await Promise.all(
      sessionIdentifiersToDelete.map(
        async sessionIdentifier => await store.removeSession(sessionIdentifier)
      )
    );
  }
  const keyBundleJSONbyRecipientIdAndDeviceId = keyBundles.reduce(
    (result, keyBundle) => {
      const username = keyBundle.recipientId;
      const deviceId = keyBundle.deviceId;
      const domain = keyBundle.domain;
      const recipientId =
        keyBundle.domain === appDomain ? username : `${username}@${domain}`;
      const recipientKeys = result[recipientId] || {};
      const item = { ...recipientKeys, [deviceId]: keyBundle };
      return { ...result, [recipientId]: item };
    },
    {}
  );
  const criptextEmails = await createEmails(
    body,
    preview,
    recipientDomains,
    knownAddresses,
    keyBundleJSONbyRecipientIdAndDeviceId,
    guestDomains,
    peer,
    files
  );
  const guestEmail = await createGuestEmail({
    externalEmailPassword,
    recipientDomains,
    guestDomains,
    files,
    body
  });

  const data = noNulls({
    subject,
    threadId,
    criptextEmails,
    guestEmail,
    files
  });
  const res = await postEmail(data);
  if (res.status === 429) {
    const seconds = res.headers['retry-after'];
    const tooManyRequestErrorMessage = { ...string.errors.tooManyRequests };
    tooManyRequestErrorMessage['description'] += parseRateLimitBlockingTime(
      seconds
    );
    throw new CustomError(tooManyRequestErrorMessage);
  } else if (res.status !== 200) {
    throw new CustomError({
      name: string.errors.encrypting.name,
      description:
        string.errors.encrypting.description + `${res.status || 'Unknown'}`
    });
  }
  return res;
};

const createGuestEmail = async ({
  externalEmailPassword,
  recipients,
  guestDomains,
  files,
  body
}) => {
  const externalRecipients = recipients.reduce((result, recipient) => {
    if (guestDomains.indexOf(recipient.domain) <= -1) {
      return result;
    }
    return {
      ...result,
      [recipient.type]: [
        ...result[recipient.type],
        `${recipient.username}@${recipient.domain}`
      ]
    };
  }, {});
  const { to, cc, bcc } = externalRecipients;
  const allExternalRecipients = [...to, ...cc, ...bcc];
  const hasExternalRecipients = allExternalRecipients.length > 0;
  if (!hasExternalRecipients) return null;

  let fileKey = null,
    fileKeys = null;
  if (files.length) {
    const fileWithKeys = files.filter(file => file.key && file.iv)[0];
    fileKey = fileWithKeys ? `${fileWithKeys.key}:${fileWithKeys.iv}` : null;
    fileKeys = files ? files.map(() => fileKey) : null;
  }
  const hasPassphrase = externalEmailPassword.length > 0;
  const { session, encryptedBody } = hasPassphrase
    ? await encryptExternalEmail({
        body,
        externalEmailPassword,
        fileKey,
        fileKeys
      })
    : { session: null, encryptedBody: null };

  const guestBody = hasPassphrase ? encryptedBody : body;
  const guestEmailParams = {
    to,
    cc,
    bcc,
    body: guestBody,
    session,
    fileKey,
    fileKeys
  };
  return noNulls(guestEmailParams);
};

const createDummyKeyBundle = async ({ fileKey, fileKeys }) => {
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
  const dummySession = noNulls({
    fileKey,
    fileKeys,
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
  });
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
  fileKey,
  fileKeys
}) => {
  const recipient = externalEmailPassword;
  const deviceId = 1;
  const { dummySession, sessionParams } = await createDummyKeyBundle({
    fileKey,
    fileKeys
  });
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
  const { key, iv, salt } = generateKeyAndIv(externalEmailPassword);
  const session = encryptDummySession({
    dummyString: JSON.stringify(dummySession),
    keyB64: key,
    IvB64: iv,
    saltB64: salt
  });
  return {
    session,
    encryptedBody: encryptedBody.body
  };
};

export { encryptPostEmail, createDummyKeyBundle };
