/*global libsignal util*/

import {
  LabelType,
  createLabel,
  createAccount as createAccountDB,
  getAccount,
  myAccount,
  postKeyBundle,
  errors,
  createContact
} from './../utils/electronInterface';
import SignalProtocolStore from './store';

const KeyHelper = libsignal.KeyHelper;
const store = new SignalProtocolStore();
const PREKEY_INITIAL_QUANTITY = 100;
const appDomain = 'jigl.com';

const createAccountWithNewDevice = async ({
  recipientId,
  deviceId,
  name,
  token
}) => {
  const signedPreKeyId = 1;
  const preKeyIds = Array.apply(null, { length: PREKEY_INITIAL_QUANTITY }).map(
    (item, index) => index + 1
  );

  const { identityKey, registrationId } = await generateIdentity();
  const {
    keybundle,
    preKeyPairArray,
    signedPreKeyPair
  } = await generatePreKeyBundle({
    identityKey,
    registrationId,
    signedPreKeyId,
    preKeyIds
  });
  const res = await postKeyBundle(keybundle);
  if (res.status !== 200) {
    throw errors.login.FAILED;
  }

  const privKey = util.toBase64(identityKey.privKey);
  const pubKey = util.toBase64(identityKey.pubKey);
  const jwt = token;
  await createAccountDB({
    recipientId,
    deviceId,
    name,
    jwt,
    privKey,
    pubKey,
    registrationId
  });
  const [newAccount] = await getAccount();
  myAccount.initialize(newAccount);
  await Promise.all(
    Object.keys(preKeyPairArray).map(async (preKeyPair, index) => {
      await store.storePreKey(preKeyIds[index], preKeyPairArray[preKeyPair]);
    }),
    store.storeSignedPreKey(signedPreKeyId, signedPreKeyPair)
  );
  const labels = Object.values(LabelType);
  await createLabel(labels);
  await createContact({
    name,
    email: `${recipientId}@${appDomain}`
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
  signedPreKeyId,
  preKeyIds
}) => {
  const preKeyPairArray = [];
  const preKeys = await Promise.all(
    preKeyIds.map(async preKeyId => {
      const preKey = await KeyHelper.generatePreKey(preKeyId);
      preKeyPairArray.push(preKey.keyPair);
      return {
        publicKey: util.toBase64(preKey.keyPair.pubKey),
        id: preKeyId
      };
    })
  );
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
    preKeys
  };
  const data = {
    keybundle,
    preKeyPairArray,
    signedPreKeyPair: signedPreKey.keyPair
  };
  return data;
};

export default {
  createAccountWithNewDevice,
  generatePreKeyBundle
};
