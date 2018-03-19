/*global libsignal util*/
import { findKeyBundles, postEmail } from './../utils/electronInterface';
import SignalProtocolStore from './store';

const store = new SignalProtocolStore();

const encryptText = async (name, deviceId, textMessage) => {
  const addressTo = new libsignal.SignalProtocolAddress(name, deviceId);
  const res = await findKeyBundles({
    recipients: [name],
    knownAddresses: {}
  });
  if (res.status !== 200) {
    return null;
  }
  const keysBundleTo = keysToArrayBuffer(res.body[0]);
  const sessionBuilder = new libsignal.SessionBuilder(store, addressTo);
  await sessionBuilder.processPreKey(keysBundleTo);
  const sessionCipher = new libsignal.SessionCipher(store, addressTo);
  await store.loadSession(addressTo);
  const ciphertext = await sessionCipher.encrypt(textMessage);
  return util.toBase64(util.toArrayBuffer(ciphertext.body));
};

const keysToArrayBuffer = keys => {
  return {
    identityKey: util.toArrayBufferFromBase64(keys.identityPublicKey),
    preKey: {
      keyId: keys.preKey.id,
      publicKey: util.toArrayBufferFromBase64(keys.preKey.publicKey)
    },
    registrationId: keys.registrationId,
    signedPreKey: {
      keyId: keys.signedPreKeyId,
      publicKey: util.toArrayBufferFromBase64(keys.signedPreKeyPublic),
      signature: util.toArrayBufferFromBase64(keys.signedPreKeySignature)
    }
  };
};

const encryptPostEmail = async (subject, to, body) => {
  const emailsEncrypted = await Promise.all(
    to.map(async item => {
      const { recipientId, deviceId, type } = item;
      const bodyEncrypted = await encryptText(recipientId, deviceId, body);
      if (!bodyEncrypted) {
        return;
      }
      return {
        recipientId,
        deviceId,
        body: bodyEncrypted,
        type
      };
    })
  );
  const criptextEmails = emailsEncrypted.filter(email => email !== undefined);
  if (!criptextEmails.length) {
    throw new Error('Error encrypting, try again');
  }
  const data = {
    subject,
    criptextEmails
  };
  return await postEmail(data);
};

export default {
  encryptPostEmail
};
