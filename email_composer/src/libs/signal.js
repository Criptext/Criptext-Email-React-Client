/*global libsignal util*/
import { findKeyBundles, postEmail } from './../utils/electronInterface';
import SignalProtocolStore from './store';

const store = new SignalProtocolStore();

const encryptText = async (params, textMessage) => {
  const addressesTo = params.map(param => {
    return new libsignal.SignalProtocolAddress(
      param.recipientId,
      param.deviceId
    );
  });

  const recipients = params.map(item => item.recipientId);
  const deviceIds = params.map(item => item.deviceId);
  const types = params.map(item => item.type);
  const res = await findKeyBundles({
    recipients,
    knownAddresses: {}
  });
  if (res.status !== 200) {
    return new Array(recipients.length).fill(null);
  }

  const arrayBody = res.body;
  const arrayKeysBundleTo = arrayBody.map(body => {
    return keysToArrayBuffer(body);
  });
  return await Promise.all(
    addressesTo.map(async (addressTo, index) => {
      const sessionBuilder = new libsignal.SessionBuilder(store, addressTo);
      await sessionBuilder.processPreKey(arrayKeysBundleTo[index]);
      const sessionCipher = new libsignal.SessionCipher(store, addressTo);
      await store.loadSession(addressTo);
      const ciphertext = await sessionCipher.encrypt(textMessage);
      const body = util.toBase64(util.toArrayBuffer(ciphertext.body));
      return {
        body,
        deviceId: deviceIds[index],
        recipientId: recipients[index],
        type: types[index]
      };
    })
  );
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
  const emailsEncrypted = await encryptText(to, body);
  const criptextEmails = emailsEncrypted.filter(email => email !== null);
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
