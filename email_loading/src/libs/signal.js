import {
  myAccount,
  LabelType,
  mySettings,
  isFromStore
} from './../utils/electronInterface';
import {
  cleanDatabase,
  createContact,
  createLabel,
  createTables,
  getAccount,
  getComputerName,
  getKeyBundle,
  postKeyBundle,
  postUser,
  updateAccount,
  getSystemLanguage,
  getAllLabels,
  getContactByEmails,
  restartAlice
} from './../utils/ipc';
import {
  createAccountCredentials,
  generateKeyBundle,
  fetchDecryptKey,
  createSession,
  encryptKey
} from './../utils/ApiUtils';
import { CustomError } from './../utils/CustomError';
import { appDomain } from './../utils/const';
import { parseRateLimitBlockingTime } from '../utils/TimeUtils';
import string from './../lang';

const createAccount = async ({
  recipientId,
  password,
  name,
  deviceType,
  recoveryEmail
}) => {
  const [currentAccount] = await getAccount();
  console.log('currentAccount', currentAccount);
  const username = currentAccount ? currentAccount.recipientId : null;
  if (username) {
    await cleanDatabase(username);
  }
  // await createTables();
  const keybundle = await createAcountAndGetKeyBundle({
    recipientId,
    name,
    deviceId: 1,
    deviceType
  });
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
  try {
    updateAccount({
      recipientId,
      refreshToken,
      jwt: token
    });
  } catch (createAccountDbError) {
    throw CustomError(string.errors.updateAccountData);
  }
  await setDefaultSettings();
  await createSystemLabels();
  const email = `${recipientId}@${appDomain}`;
  const [newAccount] = await getAccount();
  await createOwnContact(name, email, newAccount.id);
  if (!newAccount) {
    throw CustomError(string.errors.saveLocal);
  }
  myAccount.initialize(newAccount);
  return true;
};

const createAcountAndGetKeyBundle = async ({
  recipientId,
  name,
  deviceType,
  deviceId
}) => {
  const [currentAccount] = await getAccount();
  if (currentAccount && currentAccount.recipientId !== recipientId) {
    await cleanDatabase(currentAccount.recipientId);
    await createTables();
  }
  const accountRes = await aliceRequestWrapper(() => {
    return createAccountCredentials({
      recipientId,
      name,
      deviceId
    });
  });
  if (accountRes.status !== 200) {
    throw CustomError(string.errors.updateAccountData);
  }
  const keybundleRes = await aliceRequestWrapper(() => {
    return generateKeyBundle({ recipientId });
  });
  if (keybundleRes.status !== 200) {
    throw CustomError(string.errors.prekeybundleFailed);
  }
  const jsonRes = await keybundleRes.json();
  const pcName = await getComputerName();
  const keybundle = {
    deviceName: pcName || window.navigator.platform,
    deviceFriendlyName: pcName || window.navigator.platform,
    deviceType,
    ...jsonRes
  };

  return keybundle;
};

const createAccountWithNewDevice = async ({
  recipientId,
  deviceId,
  name,
  deviceType
}) => {
  const keybundle = await createAcountAndGetKeyBundle({
    recipientId,
    deviceId,
    name,
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
  try {
    await updateAccount({
      jwt: token,
      refreshToken,
      recipientId,
      isActive: true,
      isLoggedIn: true
    });
  } catch (createAccountDbError) {
    throw CustomError(string.errors.updateAccountData);
  }
  await createSystemLabels();
  const [newAccount] = await getAccount();
  myAccount.initialize(newAccount);
  const email = recipientId.includes(`@`)
    ? recipientId
    : `${recipientId}@${appDomain}`;
  await createOwnContact(name, email, newAccount.id);
  await setDefaultSettings();
  return true;
};

const generateAccountAndKeys = async ({
  recipientId,
  name,
  deviceType,
  deviceId
}) => {
  const [currentAccount] = await getAccount();
  if (currentAccount && currentAccount.recipientId !== recipientId) {
    await cleanDatabase(currentAccount.recipientId);
    await createTables();
  }
  const keybundle = await createAcountAndGetKeyBundle({
    recipientId,
    deviceId,
    name,
    deviceType
  });
  return keybundle;
};

const uploadKeys = async keybundle => {
  const { status, body } = await postKeyBundle(keybundle);
  if (status !== 200) {
    throw CustomError({
      name: string.errors.postKeybundle.name,
      description: string.errors.postKeybundle.description + status
    });
  }
  const { token, refreshToken } = body;
  return {
    jwt: token,
    refreshToken
  };
};

const createAccountToDB = async ({
  name,
  jwt,
  refreshToken,
  deviceId,
  recipientId,
  isRecipientApp
}) => {
  try {
    await updateAccount({
      jwt,
      refreshToken,
      deviceId,
      recipientId
    });
  } catch (createAccountDbError) {
    throw CustomError(string.errors.updateAccountData);
  }
  await createSystemLabels();
  const email = isRecipientApp ? `${recipientId}@${appDomain}` : recipientId;
  await createOwnContact(name, email);
  const [newAccount] = await getAccount();
  myAccount.initialize(newAccount);
  await setDefaultSettings();
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
    const labels = Object.values(LabelType);
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
      await createContact([{ name, email }]);
    } catch (createContactDbError) {
      throw CustomError(string.errors.saveOwnContact);
    }
  }
};

const decryptKey = async ({ text, recipientId, deviceId, messageType = 3 }) => {
  if (typeof deviceId !== 'number' && typeof messageType !== 'number') {
    return text;
  }
  const res = await aliceRequestWrapper(() => {
    return fetchDecryptKey({
      recipientId,
      deviceId,
      messageType,
      key: text
    });
  });
  const decryptedText = await res.arrayBuffer();
  return decryptedText;
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
  const res = await aliceRequestWrapper(() => {
    return createSession({
      accountRecipientId: recipientId,
      keybundles: [
        {
          ...newKeyBundle,
          recipientId:
            newKeyBundle.domain === appDomain
              ? newKeyBundle.recipientId
              : `${newKeyBundle.recipientId}@${newKeyBundle.domain}`
        }
      ]
    });
  });
  if (res.status !== 200) {
    throw CustomError(string.errors.prekeybundleFailed);
  }
  const encryptRes = await aliceRequestWrapper(() => {
    return encryptKey({
      recipientId,
      deviceId,
      key
    });
  });
  if (encryptRes.status !== 200) {
    throw CustomError(string.errors.prekeybundleFailed);
  }

  const encryptedKey = await encryptRes.text();
  return encryptedKey;
};

const aliceRequestWrapper = async func => {
  let retries = 3;
  let res;
  while (retries >= 0) {
    retries -= 1;
    try {
      res = await func();
      if (res.status === 200) break;
    } catch (ex) {
      if (ex.toString() !== 'TypeError: Failed to fetch') break;
      await restartAlice();
    }
  }
  return res;
};

export default {
  createAccount,
  createAccountToDB,
  createAccountWithNewDevice,
  decryptKey,
  generateAccountAndKeys,
  uploadKeys,
  encryptKeyForNewDevice
};
