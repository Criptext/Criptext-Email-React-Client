/*global libsignal util*/

import {
  myAccount,
  LabelType,
  mySettings,
  isFromStore
} from './../utils/electronInterface';
import {
  createAccount as createAccountDB,
  createContact,
  createLabel,
  getAccount,
  getComputerName,
  getKeyBundle,
  postKeyBundle,
  postUser,
  updateAccount,
  getSystemLanguage,
  deleteAccountByParams,
  getAccountByParams,
  getAllLabels,
  getContactByEmails
} from './../utils/ipc';
import { CustomError } from './../utils/CustomError';
import SignalProtocolStore from './store';
import { appDomain } from './../utils/const';
import { parseRateLimitBlockingTime } from '../utils/TimeUtils';
import string from './../lang';

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
  deviceType,
  recoveryEmail
}) => {
  // Delete logged out accounts
  await deleteAccountByParams({ isLoggedIn: false });

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
    preKeyIds,
    deviceType
  });
  if (!keybundle || !preKeyPairArray || !signedPreKeyPair) {
    throw CustomError(string.errors.prekeybundleFailed);
  }
  const { status, body, headers } = await postUser({
    recipientId,
    password,
    name,
    recoveryEmail,
    keybundle
  });
  if (status === 400) {
    throw CustomError(string.errors.alreadyExists);
  } else if (status === 429) {
    const seconds = headers['retry-after'];
    const tooManyRequestErrorMessage = { ...string.errors.tooManyRequests };
    tooManyRequestErrorMessage['description'] += parseRateLimitBlockingTime(
      seconds
    );
    throw CustomError(tooManyRequestErrorMessage);
  } else if (status !== 200) {
    throw CustomError({
      name: string.errors.createUserFailed.name,
      description: string.errors.createUserFailed.description + status
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
    throw CustomError(string.errors.saveLocal);
  }
  const [newAccount] = await getAccount();
  if (!newAccount) {
    throw CustomError(string.errors.saveLocal);
  }
  myAccount.initialize(newAccount);
  await setDefaultSettings();

  await Promise.all(
    Object.keys(preKeyPairArray).map(async (preKeyPair, index) => {
      await store.storePreKey(preKeyIds[index], preKeyPairArray[preKeyPair]);
    }),
    store.storeSignedPreKey(signedPreKeyId, signedPreKeyPair)
  );
  await createSystemLabels();
  const email = `${recipientId}@${appDomain}`;
  await createOwnContact(name, email);
  return true;
};

const createAccountWithNewDevice = async ({
  recipientId,
  deviceId,
  name,
  deviceType
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
    preKeyIds,
    deviceType
  });
  if (!keybundle || !preKeyPairArray || !signedPreKeyPair) {
    throw CustomError(string.errors.prekeybundleFailed);
  }
  const { status, body } = await postKeyBundle(keybundle);
  if (status !== 200) {
    throw CustomError({
      name: string.errors.postKeybundle.name,
      description: string.errors.postKeybundle.description + status
    });
  }
  const { token, refreshToken } = body;
  const privKey = util.toBase64(identityKey.privKey);
  const pubKey = util.toBase64(identityKey.pubKey);

  const [existsAccount] = await getAccountByParams({ recipientId });
  if (!existsAccount) {
    try {
      await deleteAccountByParams({
        isLoggedIn: false
      });
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
      throw CustomError(string.errors.saveLocal);
    }
    await createSystemLabels();
    const email = `${recipientId}@${appDomain}`;
    await createOwnContact(name, email);
  } else {
    if (!existsAccount.isLoggedIn) {
      try {
        await updateAccount({
          jwt: token,
          refreshToken,
          deviceId,
          name,
          privKey,
          pubKey,
          recipientId,
          registrationId,
          isActive: true,
          isLoggedIn: true
        });
      } catch (updateAccountDbError) {
        throw CustomError(string.errors.updateAccountData);
      }
    }
  }
  const [newAccount] = await getAccount();
  myAccount.initialize(newAccount);
  await setDefaultSettings();

  await Promise.all(
    Object.keys(preKeyPairArray).map(async (preKeyPair, index) => {
      await store.storePreKey(preKeyIds[index], preKeyPairArray[preKeyPair]);
    }),
    store.storeSignedPreKey(signedPreKeyId, signedPreKeyPair)
  );
  return true;
};

const uploadKeys = async ({ deviceType }) => {
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
    preKeyIds,
    deviceType
  });
  const { status, body } = await postKeyBundle(keybundle);
  if (status !== 200) {
    throw CustomError({
      name: string.errors.postKeybundle.name,
      description: string.errors.postKeybundle.description + status
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
  jwt,
  refreshToken,
  deviceId,
  name,
  privKey,
  pubKey,
  recipientId,
  registrationId,
  preKeyIds,
  preKeyPairArray,
  signedPreKeyId,
  signedPreKeyPair
}) => {
  const [existsAccount] = await getAccountByParams({ recipientId });
  if (!existsAccount) {
    try {
      await deleteAccountByParams({ isLoggedIn: false });
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
      throw CustomError(string.errors.saveLocal);
    }
    await createSystemLabels();
    const email = `${recipientId}@${appDomain}`;
    await createOwnContact(name, email);
  } else {
    if (!existsAccount.isLoggedIn) {
      try {
        await updateAccount({
          jwt,
          refreshToken,
          deviceId,
          name,
          privKey,
          pubKey,
          recipientId,
          registrationId,
          isActive: true,
          isLoggedIn: true
        });
      } catch (updateAccountDbError) {
        throw CustomError(string.errors.updateAccountData);
      }
    }
  }
  const [newAccount] = await getAccount();
  myAccount.initialize(newAccount);
  await setDefaultSettings();

  await Promise.all(
    Object.keys(preKeyPairArray).map(async (preKeyPair, index) => {
      await store.storePreKey(preKeyIds[index], preKeyPairArray[preKeyPair]);
    }),
    store.storeSignedPreKey(signedPreKeyId, signedPreKeyPair)
  );
  return newAccount.id;
};

const setDefaultSettings = async () => {
  if (!mySettings.theme) {
    const language = await getSystemLanguage();
    mySettings.initialize({
      language,
      opened: false,
      theme: 'light',
      isFromStore: isFromStore
    });
  }
};

const createSystemLabels = async () => {
  const prevLabels = await getAllLabels();
  const prevSystemLabels = prevLabels.map(label => label.type === 'system');
  if (!prevSystemLabels.length) {
    const labels = Object.values(LabelType).map(systemLabel =>
      Object.assign(systemLabel, { accountId: null })
    );
    try {
      await createLabel(labels);
    } catch (createLabelsDbError) {
      throw CustomError(string.errors.saveLabels);
    }
  }
};

const createOwnContact = async (name, email) => {
  const [prevOwnContact] = await getContactByEmails([email]);
  if (!prevOwnContact) {
    try {
      await createContact({ name, email });
    } catch (createContactDbError) {
      throw CustomError(string.errors.saveOwnContact);
    }
  }
};

const createSystemLabels = async () => {
  const prevLabels = await getAllLabels();
  const prevSystemLabels = prevLabels.map(label => label.type === 'system');
  if (!prevSystemLabels.length) {
    const labels = Object.values(LabelType).map(systemLabel =>
      Object.assign(systemLabel, { accountId: null })
    );
    try {
      await createLabel(labels);
    } catch (createLabelsDbError) {
      throw CustomError(string.errors.saveLabels);
    }
  }
};

const createOwnContact = async (name, email) => {
  const [prevOwnContact] = await getContactByEmails([email]);
  if (!prevOwnContact) {
    try {
      await createContact({ name, email });
    } catch (createContactDbError) {
      throw CustomError(string.errors.saveOwnContact);
    }
  }
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
  preKeyIds,
  deviceType
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
    deviceType,
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
