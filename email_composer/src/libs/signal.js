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
  createObjectRecipientIdDomainByDevices,
  filterRecipientsByBlacklisted
} from './../utils/EncryptionUtils';
import string from './../lang';
import { appDomain } from '../utils/const';
import { createSession, encryptEmail } from '../utils/ApiUtils';
import { myAccount } from '../utils/electronInterface';

const KeyHelper = libsignal.KeyHelper;
const store = new SignalProtocolStore();

const getKeyBundlesOfRecipients = async domains => {
  const res = await findKeyBundles({
    domains
  });
  if (res.status === 451) {
    throw new CustomError(string.errors.suspendedUser);
  } else if (res.status !== 200) {
    return new Array(domains.length).fill(null);
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
  domainAddresses,
  keyBundles,
  guestDomains,
  peer,
  files
) => {
  const myKeyBundles = keyBundles.map(keybundle => {
    return {
      ...keybundle,
      recipientId:
        keybundle.domain === appDomain
          ? keybundle.recipientId
          : `${keybundle.recipientId}@${keybundle.domain}`
    };
  });
  while (myKeyBundles.length > 0) {
    const keyBundlesBatch = myKeyBundles.splice(0, 30);
    await createSession({
      accountRecipientId: myAccount.recipientId,
      keybundles: keyBundlesBatch
    });
  }

  const criptextEmailsByRecipientId = {};
  for (const recipient of recipients) {
    const { recipientId, type, username, domain } = recipient;

    if (guestDomains.indexOf(domain) > -1) {
      continue;
    }

    if (!criptextEmailsByRecipientId[recipientId]) {
      criptextEmailsByRecipientId[recipientId] = {
        username,
        domain,
        type,
        emails: []
      };
    }

    const domainIndex = domainAddresses.findIndex(domainAddress => {
      return domainAddress.name === domain;
    });

    const knownDeviceIds =
      domainAddresses[domainIndex].knownAddresses[username] || [];
    const newDevicesIds = keyBundles
      .filter(
        keybundle =>
          keybundle.recipientId === username && keybundle.domain === domain
      )
      .map(keybundle => keybundle.deviceId);
    const deviceIds = [...knownDeviceIds, ...newDevicesIds].filter(
      deviceId => peer.recipientId !== username || peer.deviceId !== deviceId
    );
    for (const deviceId of deviceIds) {
      const fileKeys = files
        ? files.reduce((result, file) => {
            if (!file.key || !file.iv) {
              return result;
            }
            return [...result, `${file.key}:${file.iv}`];
          }, [])
        : null;
      const res = await encryptEmail({
        accountRecipientId: myAccount.recipientId,
        body,
        preview,
        fileKeys,
        recipientId,
        deviceId
      });
      const {
        bodyEncrypted,
        previewEncrypted,
        bodyMessageType,
        previewMessageType,
        fileKeysEncrypted
      } = await res.json();
      const fileKey =
        fileKeysEncrypted && fileKeysEncrypted.length > 0
          ? fileKeysEncrypted[0]
          : null;

      let criptextEmail = {
        recipientId: username,
        deviceId,
        body: bodyEncrypted,
        messageType: bodyMessageType,
        preview: previewEncrypted,
        previewMessageType: previewMessageType
      };
      if (fileKey) {
        criptextEmail = {
          ...criptextEmail,
          fileKey: fileKey,
          fileKeys: fileKeysEncrypted
        };
      }
      criptextEmailsByRecipientId[recipientId]['emails'].push(criptextEmail);
    }
  }
  return Object.values(criptextEmailsByRecipientId);
};

const encryptPostEmail = async ({
  recipients,
  body,
  bodyWithSign,
  preview,
  subject,
  threadId,
  files,
  peer,
  externalEmailPassword
}) => {
  const recipientIds = recipients.map(item => item.recipientId);
  const sessions = await getSessionRecordByRecipientIds(recipientIds);
  let domainAddresses = createObjectRecipientIdDomainByDevices(
    sessions,
    recipients,
    appDomain
  );
  const {
    keyBundles,
    blacklistedKnownDevices,
    guestDomains
  } = await getKeyBundlesOfRecipients(domainAddresses);
  if (keyBundles.includes(null)) {
    throw new CustomError(string.errors.unauthorized);
  }
  if (blacklistedKnownDevices.length) {
    const {
      domainAddressesFiltered,
      sessionIdentifiersToDelete
    } = filterRecipientsByBlacklisted(
      blacklistedKnownDevices,
      domainAddresses,
      appDomain
    );
    domainAddresses = domainAddressesFiltered;
    await Promise.all(
      sessionIdentifiersToDelete.map(
        async sessionIdentifier => await store.removeSession(sessionIdentifier)
      )
    );
  }
  const criptextEmails = await createEmails(
    body,
    preview,
    recipients,
    domainAddresses,
    keyBundles,
    guestDomains,
    peer,
    files
  );
  const guestEmail = await createGuestEmail({
    externalEmailPassword,
    recipients,
    guestDomains,
    files,
    body: bodyWithSign
  });
  const data = noNulls({
    subject,
    threadId,
    criptextEmails,
    guestEmail,
    files: files ? files : null
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
    if (!result[recipient.type]) {
      return {
        ...result,
        [recipient.type]: [`${recipient.username}@${recipient.domain}`]
      };
    }
    return {
      ...result,
      [recipient.type]: [
        ...result[recipient.type],
        `${recipient.username}@${recipient.domain}`
      ]
    };
  }, {});
  const { to = [], cc = [], bcc = [] } = externalRecipients;
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
