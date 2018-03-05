/*global libsignal util*/
import ClientAPI from '@criptext/email-http-client';
import SignalProtocolStore from './store';

const KeyHelper = libsignal.KeyHelper;
const store = new SignalProtocolStore();
const client = new ClientAPI('http://localhost:8000');

const createUser = async data => {
  return await client.postUser(data);
};

const authUser = async data => {
  return await client.login(data);
};

const createStore = async (identityKey, registrationId) => {
  if (!identityKey && !registrationId) {
    identityKey = await KeyHelper.generateIdentityKeyPair();
    registrationId = await KeyHelper.generateRegistrationId();
  }
  await store.createStore(identityKey, registrationId);
};

const generatePreKeyBundle = async (preKeyId, signedPreKeyId) => {
  const identity = await store.getIdentityKeyPair();
  const registrationId = await store.getLocalRegistrationId();
  const preKey = await KeyHelper.generatePreKey(preKeyId);
  const signedPreKey = await KeyHelper.generateSignedPreKey(
    identity,
    signedPreKeyId
  );

  const bundle = {
    signedPreKeySignature: util.toBase64(signedPreKey.signature),
    signedPreKeyPublic: util.toBase64(signedPreKey.keyPair.pubKey),
    signedPreKeyId: signedPreKeyId,
    identityPublicKey: util.toBase64(identity.pubKey),
    registrationId: registrationId,
    preKeys: [{ publicKey: util.toBase64(preKey.keyPair.pubKey), id: preKeyId }]
  };
  const res = await client.postKeyBundle(bundle);
  if (res.status === 200) {
    await store.storeKeys(
      preKeyId,
      preKey.keyPair,
      signedPreKeyId,
      signedPreKey.keyPair
    );
    return true;
  }
  return false;
};

const encryptText = async (name, deviceId, textMessage) => {
  const addressTo = new libsignal.SignalProtocolAddress(name, deviceId);
  const res = await client.getKeyBundle(name, deviceId);
  const keysBundleTo = keysToArrayBuffer(res.body);
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

const encryptEmail = async (subject, to, body) => {
  const criptextEmails = await Promise.all(
    to.map(async item => {
      const { recipientId, deviceId, type } = item;
      return {
        recipientId,
        deviceId,
        body: await encryptText(recipientId, deviceId, body),
        type
      };
    })
  );
  const data = {
    subject,
    criptextEmails
  };
  return await client.postEmail(data);
};

const getEvents = async ({ recipientId, deviceId }) => {
  const res = await client.getPendingEvents({
    recipientId,
    deviceId
  });
  return formEvents(res.body);
};

const formEvents = events => {
  return events.map(event => {
    const { params, cmd } = event;
    return { cmd, params: JSON.parse(params) };
  });
};

const decryptEmail = async (bodyKey, name, deviceId) => {
  const res = await client.getEmailBody(bodyKey);
  const textEncrypted = util.toArrayBufferFromBase64(res.text);
  const addressFrom = new libsignal.SignalProtocolAddress(name, deviceId);
  const sessionCipher = new libsignal.SessionCipher(store, addressFrom);
  const binaryText = await sessionCipher.decryptPreKeyWhisperMessage(
    textEncrypted,
    'binary'
  );
  return util.toString(binaryText);
};

export default {
  authUser,
  createStore,
  createUser,
  decryptEmail,
  encryptEmail,
  generatePreKeyBundle,
  getEvents
};
