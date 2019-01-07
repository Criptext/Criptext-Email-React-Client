/*global libsignal util*/

import {
  createAccount as createAccountDB,
  myAccount,
  errors,
  createContact,
  LabelType,
  createTables,
  postKeyBundle,
  updateAccount
} from './../utils/electronInterface';
import {
  cleanDataBase,
  createLabel,
  getAccount,
  getComputerName,
  getKeyBundle,
  postUser
} from './../utils/ipc';
import { CustomError } from './../utils/CustomError';
import SignalProtocolStore from './store';
import { appDomain, DEVICE_TYPE } from './../utils/const';
import { parseRateLimitBlockingTime } from '../utils/TimeUtils';

const KeyHelper = libsignal.KeyHelper;
const store = new SignalProtocolStore();
const PREKEY_INITIAL_QUANTITY = 100;
const ciphertextType = {
  CIPHERTEXT: 1,
  PREKEY_BUNDLE: 3
};

const createAccount = async ({
  recipientId,
  password,
  name,
  recoveryEmail
}) => {
  await cleanDataBase();
  await createTables();

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
  if (!keybundle || !preKeyPairArray || !signedPreKeyPair) {
    throw CustomError(errors.user.PREKEYBUNDLE_FAILED);
  }
  const { status, body, headers } = await postUser({
    recipientId,
    password,
    name,
    recoveryEmail,
    keybundle
  });
  if (status === 400) {
    throw CustomError(errors.user.ALREADY_EXISTS);
  } else if (status === 429) {
    const seconds = headers['retry-after'];
    const tooManyRequestErrorMessage = { ...errors.login.TOO_MANY_REQUESTS };
    tooManyRequestErrorMessage['description'] += parseRateLimitBlockingTime(
      seconds
    );
    throw CustomError(tooManyRequestErrorMessage);
  } else if (status !== 200) {
    throw CustomError({
      name: errors.user.CREATE_USER_FAILED.name,
      description: errors.user.CREATE_USER_FAILED.description + status
    });
  }
  const { token, refreshToken } = body;
  const privKey = util.toBase64(identityKey.privKey);
  const pubKey = util.toBase64(identityKey.pubKey);
  try {
    await createAccountDB({
      recipientId,
      deviceId: 1,
      name,
      jwt: token,
      refreshToken,
      privKey,
      pubKey,
      registrationId
    });
  } catch (createAccountDbError) {
    throw CustomError(errors.user.SAVE_LOCAL);
  }
  const [newAccount] = await getAccount();
  if (!newAccount) {
    throw CustomError(errors.user.SAVE_LOCAL);
  }
  myAccount.initialize(newAccount);

  await Promise.all(
    Object.keys(preKeyPairArray).map(async (preKeyPair, index) => {
      await store.storePreKey(preKeyIds[index], preKeyPairArray[preKeyPair]);
    }),
    store.storeSignedPreKey(signedPreKeyId, signedPreKeyPair)
  );
  const labels = Object.values(LabelType);
  try {
    await createLabel(labels);
  } catch (createLabelsDbError) {
    throw CustomError(errors.user.SAVE_LABELS);
  }
  try {
    await createContact({
      name,
      email: `${recipientId}@${appDomain}`
    });
  } catch (createContactDbError) {
    throw CustomError(errors.user.SAVE_OWN_CONTACT);
  }
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
  if (!keybundle || !preKeyPairArray || !signedPreKeyPair) {
    throw CustomError(errors.user.PREKEYBUNDLE_FAILED);
  }
  const { status, body } = await postKeyBundle(keybundle);
  if (status !== 200) {
    throw CustomError({
      name: errors.user.POST_KEYBUNDLE.name,
      description: errors.user.POST_KEYBUNDLE.description + status
    });
  }
  const { token, refreshToken } = body;
  const privKey = util.toBase64(identityKey.privKey);
  const pubKey = util.toBase64(identityKey.pubKey);
  const [currentAccount] = await getAccount();
  const currentAccountExists = currentAccount
    ? currentAccount.recipientId === recipientId
    : false;

  if (currentAccountExists) {
    try {
      await updateAccount({
        jwt: token,
        refreshToken,
        deviceId,
        name,
        privKey,
        pubKey,
        recipientId,
        registrationId
      });
    } catch (updateAccountDbError) {
      throw CustomError(errors.user.UPDATE_ACCOUNT_DATA);
    }
  } else {
    if (currentAccount) {
      await cleanDataBase();
      await createTables();
    }
    try {
      await createAccountDB({
        jwt: token,
        refreshToken,
        deviceId,
        name,
        privKey,
        pubKey,
        recipientId,
        registrationId
      });
    } catch (createAccountDbError) {
      throw CustomError(errors.user.SAVE_LOCAL);
    }

    const labels = Object.values(LabelType);
    try {
      await createLabel(labels);
    } catch (createLabelsDbError) {
      throw CustomError(errors.user.SAVE_LABELS);
    }
    try {
      await createContact({
        name,
        email: `${recipientId}@${appDomain}`
      });
    } catch (createContactDbError) {
      throw CustomError(errors.user.SAVE_OWN_CONTACT);
    }
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

const uploadKeys = async () => {
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
  const { status, body } = await postKeyBundle(keybundle);
  if (status !== 200) {
    throw CustomError({
      name: errors.user.POST_KEYBUNDLE.name,
      description: errors.user.POST_KEYBUNDLE.description + status
    });
  }
  const { token, refreshToken } = body;
  const privKey = util.toBase64(identityKey.privKey);
  const pubKey = util.toBase64(identityKey.pubKey);
  return {
    privKey,
    pubKey,
    jwt: token,
    refreshToken,
    preKeyIds,
    preKeyPairArray,
    registrationId,
    signedPreKeyId,
    signedPreKeyPair
  };
};

const createAccountToDB = async ({
  recipientId,
  deviceId,
  name,
  jwt,
  refreshToken,
  preKeyIds,
  privKey,
  pubKey,
  registrationId,
  preKeyPairArray,
  signedPreKeyId,
  signedPreKeyPair
}) => {
  const [currentAccount] = await getAccount();
  const currentAccountExists = currentAccount
    ? currentAccount.recipientId === recipientId
    : false;

  if (currentAccountExists) {
    try {
      await updateAccount({
        jwt,
        refreshToken,
        deviceId,
        name,
        privKey,
        pubKey,
        recipientId,
        registrationId
      });
    } catch (updateAccountDbError) {
      throw CustomError(errors.user.UPDATE_ACCOUNT_DATA);
    }
  } else {
    if (currentAccount) {
      await cleanDataBase();
      await createTables();
    }
    try {
      await createAccountDB({
        jwt,
        refreshToken,
        deviceId,
        name,
        privKey,
        pubKey,
        recipientId,
        registrationId
      });
    } catch (createAccountDbError) {
      throw CustomError(errors.user.SAVE_LOCAL);
    }

    const labels = Object.values(LabelType);
    try {
      await createLabel(labels);
    } catch (createLabelsDbError) {
      throw CustomError(errors.user.SAVE_LABELS);
    }
  }
  const [newAccount] = await getAccount();
  myAccount.initialize(newAccount);

  return await Promise.all(
    Object.keys(preKeyPairArray).map(async (preKeyPair, index) => {
      await store.storePreKey(preKeyIds[index], preKeyPairArray[preKeyPair]);
    }),
    store.storeSignedPreKey(signedPreKeyId, signedPreKeyPair)
  );
};

const decryptKey = async ({ text, recipientId, deviceId, messageType = 3 }) => {
  if (typeof deviceId !== 'number' && typeof messageType !== 'number') {
    return text;
  }
  const textEncrypted = util.toArrayBufferFromBase64(text);
  const addressFrom = new libsignal.SignalProtocolAddress(
    recipientId,
    deviceId
  );
  const sessionCipher = new libsignal.SessionCipher(store, addressFrom);
  const binaryText = await decryptText(
    sessionCipher,
    textEncrypted,
    messageType
  );
  return binaryText;
};

const decryptText = async (sessionCipher, textEncrypted, messageType) => {
  switch (messageType) {
    case ciphertextType.CIPHERTEXT:
      return await sessionCipher.decryptWhisperMessage(textEncrypted, 'binary');
    case ciphertextType.PREKEY_BUNDLE:
      return await sessionCipher.decryptPreKeyWhisperMessage(
        textEncrypted,
        'binary'
      );
    default:
      break;
  }
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
  const pcName = await getComputerName();
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

const encryptKeyForNewDevice = async ({ recipientId, deviceId, key }) => {
  let newKeyBundle;
  while (!newKeyBundle) {
    const res = await getKeyBundle(deviceId);
    if (res.status === 200) {
      newKeyBundle = JSON.parse(res.text);
    }
    await setTimeout(() => {}, 5000);
  }
  let arrayBufferKeyBundle = undefined;
  if (newKeyBundle) {
    arrayBufferKeyBundle = keysToArrayBuffer(newKeyBundle);
  }
  const { body } = await encryptText(
    recipientId,
    deviceId,
    key,
    arrayBufferKeyBundle
  );
  return body;
};

export default {
  createAccount,
  createAccountToDB,
  createAccountWithNewDevice,
  decryptKey,
  generatePreKeyBundle,
  uploadKeys,
  encryptKeyForNewDevice
};
