/*global libsignal util process*/
import ClientAPI from '@criptext/email-http-client';
import SignalProtocolStore from './store';
import * as account from './account';

const KeyHelper = libsignal.KeyHelper;
const store = new SignalProtocolStore();
let client = {};
account.getToken().then(token => {
  client = new ClientAPI(process.env.REACT_APP_KEYSERVER_URL, token);
});

const createAccount = async ({
  recipientId,
  password,
  name,
  recoveryEmail
}) => {
  const preKeyId = 1;
  const signedPreKeyId = 1;
  const { identityKey, registrationId } = await generateIdentity();
  const {
    keybundle,
    preKeyPair,
    signedPreKeyPair
  } = await generatePreKeyBundle({
    identityKey,
    registrationId,
    preKeyId,
    signedPreKeyId
  });
  const res = await client.postUser({
    recipientId,
    password,
    name,
    recoveryEmail,
    keybundle
  });
  if (res.status !== 200) {
    return false;
  }

  const privKey = util.toBase64(identityKey.privKey);
  const pubKey = util.toBase64(identityKey.pubKey);
  const jwt = res.text;
  await account.create({
    recipientId,
    name,
    jwt,
    privKey,
    pubKey,
    registrationId
  });
  await store.storeKeys({
    preKeyId,
    preKeyPair,
    signedPreKeyId,
    signedPreKeyPair
  });
  return true;
};

const generateIdentity = () => {
  return Promise.all([
    KeyHelper.generateIdentityKeyPair(),
    KeyHelper.generateRegistrationId()
  ]).then(function(result) {
    const identityKey = result[0];
    const registrationId = result[1];
    return { identityKey, registrationId };
  });
};

const generatePreKeyBundle = async ({
  identityKey,
  registrationId,
  preKeyId,
  signedPreKeyId
}) => {
  const preKey = await KeyHelper.generatePreKey(preKeyId);
  const signedPreKey = await KeyHelper.generateSignedPreKey(
    identityKey,
    signedPreKeyId
  );
  const keybundle = {
    signedPreKeySignature: util.toBase64(signedPreKey.signature),
    signedPreKeyPublic: util.toBase64(signedPreKey.keyPair.pubKey),
    signedPreKeyId: signedPreKeyId,
    identityPublicKey: util.toBase64(identityKey.pubKey),
    registrationId: registrationId,
    preKeys: [{ publicKey: util.toBase64(preKey.keyPair.pubKey), id: preKeyId }]
  };

  const data = {
    keybundle,
    preKeyPair: preKey.keyPair,
    signedPreKeyPair: signedPreKey.keyPair
  };

  return data;
};

const login = data => {
  return client.login(data);
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
  createAccount,
  decryptEmail,
  encryptEmail,
  generatePreKeyBundle,
  getEvents,
  login
};
