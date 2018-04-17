/*global libsignal util*/
import {
  errors,
  findKeyBundles,
  postEmail
} from './../utils/electronInterface';
import SignalProtocolStore from './store';
import { CustomError } from './../utils/CustomError';

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
    throw new CustomError(errors.NON_EXISTING_USERS);
  }

  const objKeyBundles = keyBundles.reduce(
    (result, keyBundle) => ({ ...result, [keyBundle.recipientId]: keyBundle }),
    {}
  );

  recipientIds.forEach(recipientId => {
    const key = objKeyBundles[recipientId];
    if (key === undefined) {
      throw new CustomError({
        name: 'Error',
        description: `The user '${recipientId}' doesn't exist. Try again`
      });
    }
  });

  const criptextEmails = await Promise.all(
    keyBundles.map(async keyBundle => {
      const { recipientId, deviceId } = keyBundle;
      const keyBundleArrayBuffer = keysToArrayBuffer(keyBundle);
      const bodyEncrypted = await encryptText(
        recipientId,
        deviceId,
        keyBundleArrayBuffer,
        body
      );
      const item = recipients.filter(
        recipient => recipient.recipientId === recipientId
      )[0];
      return {
        type: item.type,
        recipientId,
        deviceId,
        body: bodyEncrypted
      };
    })
  );
  const data = {
    subject,
    criptextEmails
  };
  const res = await postEmail(data);
  if (res.status !== 200) {
    throw new CustomError(errors.ENCRYPTING_ERROR);
  }
  return res;
};

export default {
  encryptPostEmail
};
