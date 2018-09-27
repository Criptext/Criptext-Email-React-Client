/*global libsignal util*/

import {
  createLabel,
  postUser,
  createAccount as createAccountDB,
  getAccount,
  myAccount,
  errors,
  createContact,
  LabelType,
  cleanDataBase,
  createTables,
  postKeyBundle,
  updateAccount,
  getComputerName
} from './../utils/electronInterface';

import { CustomError } from './../utils/CustomError';
import SignalProtocolStore from './store';
import { appDomain, DEVICE_TYPE } from './../utils/const';

const KeyHelper = libsignal.KeyHelper;
const store = new SignalProtocolStore();
const PREKEY_INITIAL_QUANTITY = 100;

const createAccount = async ({
  recipientId,
  password,
  name,
  recoveryEmail
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
  const res = await postUser({
    recipientId,
    password,
    name,
    recoveryEmail,
    keybundle
  });
  if (res.status === 400) {
    throw CustomError(errors.user.ALREADY_EXISTS);
  }
  if (res.status !== 200) {
    return false;
  }

  const privKey = util.toBase64(identityKey.privKey);
  const pubKey = util.toBase64(identityKey.pubKey);
  const jwt = res.text;
  await createAccountDB({
    recipientId,
    deviceId: 1,
    name,
    jwt,
    privKey,
    pubKey,
    registrationId,
    recoveryEmail: recoveryEmail || '',
    recoveryEmailConfirmed: false
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

const createAccountWithNewDevice = async ({ recipientId, deviceId, name }) => {
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
  const newToken = res.text;
  const privKey = util.toBase64(identityKey.privKey);
  const pubKey = util.toBase64(identityKey.pubKey);
  const jwt = newToken;
  const [currentAccount] = await getAccount();
  const currentAccountExists = currentAccount
    ? currentAccount.recipientId === recipientId
    : false;

  if (currentAccountExists) {
    await updateAccount({
      jwt,
      deviceId,
      name,
      privKey,
      pubKey,
      recipientId,
      registrationId
    });
  } else {
    if (currentAccount) {
      await cleanDataBase();
      await createTables();
    }
    await createAccountDB({
      jwt,
      deviceId,
      name,
      privKey,
      pubKey,
      recipientId,
      registrationId
    });
    const labels = Object.values(LabelType);
    await createLabel(labels);
    await createContact({
      name,
      email: `${recipientId}@${appDomain}`
    });
  }
  const [newAccount] = await getAccount();
  myAccount.initialize(newAccount);
  await Promise.all(
    Object.keys(preKeyPairArray).map(async (preKeyPair, index) => {
      await store.storePreKey(preKeyIds[index], preKeyPairArray[preKeyPair]);
    }),
    store.storeSignedPreKey(signedPreKeyId, signedPreKeyPair)
  );
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

  const pcName = getComputerName();
  const keybundle = {
    deviceName: pcName || window.navigator.platform,
    deviceFriendlyName: pcName || window.navigator.platform,
    deviceType: DEVICE_TYPE,
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
  createAccount,
  createAccountWithNewDevice,
  generatePreKeyBundle
};
