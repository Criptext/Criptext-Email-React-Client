/*global libsignal util*/
import { findKeyBundles, postEmail } from './../utils/electronInterface';
import SignalProtocolStore from './store';

const store = new SignalProtocolStore();

const generateAddresses = recipientsAndDeviceIds => {
  return recipientsAndDeviceIds.map(item => {
    return new libsignal.SignalProtocolAddress(item.recipientId, item.deviceId);
  });
};

const formAddressesParams = to => {
  return to.map(item => {
    return {
      recipientId: item.recipientId,
      deviceId: item.deviceId
    };
  });
};

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

const encryptText = async (addressTo, arrayBufferKey, textMessage) => {
  const sessionBuilder = new libsignal.SessionBuilder(store, addressTo);
  await sessionBuilder.processPreKey(arrayBufferKey);
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
  const recipients = to.map(item => item.recipientId);
  const keyBundles = await getKeyBundlesOfRecipients(recipients);
  const recipientKeys = keyBundles.filter(key => key !== null);
  if (!recipientKeys.length) {
    throw new Error('Error encrypting. No keys. Try again');
  }

  const arrayKeyBundleTo = recipientKeys.map(keys => keysToArrayBuffer(keys));
  const addressesParams = formAddressesParams(to);
  const addresses = generateAddresses(addressesParams);
  const textsEncrypted = await Promise.all(
    addresses.map(async (address, index) => {
      return await encryptText(address, arrayKeyBundleTo[index], body);
    })
  );

  const criptextEmails = to.map((item, index) => {
    return { ...item, body: textsEncrypted[index] };
  });
  const data = {
    subject,
    criptextEmails
  };
  return await postEmail(data);
};

export default {
  encryptPostEmail
};
