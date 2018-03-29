/*global libsignal util*/
import { findKeyBundles, postEmail } from './../utils/electronInterface';
import SignalProtocolStore from './store';

const store = new SignalProtocolStore();

const getKeyBundlesOfRecipients = async recipients => {
  const res = await findKeyBundles({
    recipients,
    knownAddresses: {}
  });
  if (res.status !== 200) {
    return new Array(recipients.length).fill(null);
  }
  return res.body;
};

const encryptText = async (
  recipientId,
  deviceId,
  arrayBufferKey,
  textMessage
) => {
  const addressTo = new libsignal.SignalProtocolAddress(recipientId, deviceId);
  const sessionBuilder = new libsignal.SessionBuilder(store, addressTo);
  await sessionBuilder.processPreKey(arrayBufferKey);
  const sessionCipher = new libsignal.SessionCipher(store, addressTo);
  await store.loadSession(addressTo);
  const ciphertext = await sessionCipher.encrypt(textMessage);
  return util.toBase64(util.toArrayBuffer(ciphertext.body));
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

const encryptPostEmail = async (subject, recipients, body) => {
  const recipientIds = recipients.map(item => item.recipientId);
  const keyBundles = await getKeyBundlesOfRecipients(recipientIds);

  if (!keyBundles.length) {
    throw new Error('Non existing users. Try again');
  }

  recipientIds.forEach(recipientId => {
    const key = keyBundles.find(key => key.recipientId === recipientId);
    if (key === undefined) {
      throw new Error(`The user '${recipientId}' doesn't exist. Try again`);
    }
  });

  const criptextEmails = await Promise.all(
    recipients.map(async (item, index) => {
      const { recipientId, deviceId } = item;
      const keyBundle = keysToArrayBuffer(keyBundles[index]);
      const bodyEncrypted = await encryptText(
        recipientId,
        deviceId,
        keyBundle,
        body
      );
      return {
        ...item,
        body: bodyEncrypted
      };
    })
  );
  const data = {
    subject,
    criptextEmails
  };
  const res = await postEmail(data);
  return res;
};

export default {
  encryptPostEmail
};
