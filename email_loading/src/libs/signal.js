import {
  myAccount,
  mySettings,
  isFromStore
} from './../utils/electronInterface';
import {
  cleanDatabase,
  closeCreatingKeysLoadingWindow,
  createContact,
  createSettings,
  getAccountByParams,
  getComputerName,
  getKeyBundle,
  postKeyBundle,
  postUser,
  updateAccount,
  openLoginWindow,
  getSettings,
  getSystemLanguage,
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

const postUserCodeError = {
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  USER_FAILED: 'USER_FAILED',
  CRIPTEXT_EMAIL_NOT_CONFIRMED: 'CRIPTEXT_EMAIL_NOT_CONFIRMED',
  EMAIL_MAX_REACHED: 'EMAIL_MAX_REACHED',
  TEMPORAL_EMAIL: 'TEMPORAL_EMAIL'
};

const createAccount = async ({
  recipientId,
  password,
  name,
  deviceType,
  recoveryEmail,
  customerType
}) => {
  const [activeAccount] = await getAccountByParams({
    isActive: true
  });
  await clearOtherAccounts(recipientId);
  const keybundle = await createAcountAndGetKeyBundle({
    recipientId,
    name,
    deviceId: 1,
    deviceType
  });
  const { status, body, headers, error } = await postUser({
    recipientId,
    password,
    name,
    recoveryEmail,
    keybundle
  });
  if (status === 400) {
    openLoginWindow({
      code: postUserCodeError.ALREADY_EXISTS,
      data: string.errors.alreadyExists
    });
    closeCreatingKeysLoadingWindow();
    return;
  } else if (status === 405) {
    switch (error) {
      case 1: {
        openLoginWindow({
          code: postUserCodeError.CRIPTEXT_EMAIL_NOT_CONFIRMED,
          data: {
            description: string.errors.criptext_email_not_confirmed
          }
        });
        closeCreatingKeysLoadingWindow();
        return;
      }
      case 2: {
        openLoginWindow({
          code: postUserCodeError.EMAIL_MAX_REACHED,
          data: {
            description: string.errors.email_max_reached
          }
        });
        closeCreatingKeysLoadingWindow();
        return;
      }
      case 3: {
        openLoginWindow({
          code: postUserCodeError.TEMPORAL_EMAIL,
          data: {
            description: string.errors.temporal_email
          }
        });
        closeCreatingKeysLoadingWindow();
        return;
      }
      default: {
        openLoginWindow();
        closeCreatingKeysLoadingWindow();
        return;
      }
    }
  } else if (status === 429) {
    const seconds = headers['retry-after'];
    const tooManyRequestErrorMessage = { ...string.errors.tooManyRequests };
    tooManyRequestErrorMessage['description'] += parseRateLimitBlockingTime(
      seconds
    );
    openLoginWindow({
      code: postUserCodeError.TOO_MANY_REQUESTS,
      data: tooManyRequestErrorMessage
    });
    return;
  } else if (status !== 200) {
    openLoginWindow({
      code: postUserCodeError.USER_FAILED,
      data: {
        name: string.errors.createUserFailed.name,
        description: string.errors.createUserFailed.description + status
      }
    });
    return;
  }
  const { token, refreshToken } = body;
  try {
    await updateAccount({
      recipientId,
      refreshToken,
      jwt: token,
      isLoggedIn: true,
      isActive: !activeAccount,
      customerType
    });
  } catch (createAccountDbError) {
    throw CustomError(string.errors.updateAccountData);
  }
  await setDefaultSettings();
  const loggedAccounts = await getAccountByParams({
    isLoggedIn: true
  });
  myAccount.initialize(loggedAccounts);
  if (!myAccount.id) {
    throw CustomError(string.errors.saveLocal);
  }
  await createOwnContact(name, myAccount.email, myAccount.id);
  return activeAccount
    ? {
        recipientId,
        accountId: loggedAccounts.find(
          account => account.recipientId === recipientId
        ).id
      }
    : true;
};

const clearOtherAccounts = async recipientId => {
  const accounts = (await getAccountByParams({
    isLoggedIn: 0
  })).filter(acc => acc.recipientId !== recipientId);
  let acc;
  for (acc of accounts) {
    await cleanDatabase(acc.recipientId);
  }
};

const createAcountAndGetKeyBundle = async ({
  recipientId,
  name,
  deviceType,
  deviceId
}) => {
  const accountRes = await aliceRequestWrapper(() => {
    return createAccountCredentials({
      recipientId,
      name,
      deviceId
    });
  });
  if (!accountRes || accountRes.status !== 200) {
    throw CustomError(string.errors.encryptionService.createAccount);
  }
  const keybundleRes = await aliceRequestWrapper(() => {
    return generateKeyBundle({ recipientId });
  });
  if (!keybundleRes || keybundleRes.status !== 200) {
    throw CustomError(string.errors.encryptionService.createKeybundles);
  }
  const jsonRes = await keybundleRes.json();
  const pcName = await getComputerName();
  const keybundle = {
    recipientId,
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
  deviceType,
  customerType
}) => {
  const [activeAccount] = await getAccountByParams({
    isActive: true
  });
  await clearOtherAccounts(recipientId);
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
      isLoggedIn: true,
      isActive: !activeAccount,
      customerType
    });
  } catch (createAccountDbError) {
    throw CustomError(string.errors.updateAccountData);
  }
  const loggedAccounts = await getAccountByParams({
    isLoggedIn: true
  });
  myAccount.initialize(loggedAccounts);
  if (!myAccount.id) {
    throw CustomError(string.errors.saveLocal);
  }
  const email = myAccount.email;
  await createOwnContact(name, email, myAccount.id);
  await setDefaultSettings();
  return activeAccount
    ? {
        recipientId,
        accountId: loggedAccounts.find(
          account => account.recipientId === recipientId
        ).id
      }
    : true;
};

const generateAccountAndKeys = async ({
  recipientId,
  name,
  deviceType,
  deviceId
}) => {
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
  customerType
}) => {
  const [activeAccount] = await getAccountByParams({
    isActive: true
  });
  try {
    await updateAccount({
      jwt,
      refreshToken,
      deviceId,
      recipientId,
      isLoggedIn: true,
      isActive: !activeAccount,
      customerType
    });
  } catch (createAccountDbError) {
    throw CustomError(string.errors.updateAccountData);
  }
  await setDefaultSettings();
  const loggedAccounts = await getAccountByParams({
    isLoggedIn: true
  });
  myAccount.initialize(loggedAccounts);
  await createOwnContact(name, myAccount.email);
  if (activeAccount) {
    const newAccount = loggedAccounts.find(
      account => account.recipientId === recipientId
    );
    return {
      accountId: newAccount.id,
      id: newAccount.id,
      recipientId: newAccount.recipientId,
      email: newAccount.recipientId.includes('@')
        ? newAccount.recipientId
        : `${newAccount.recipientId}@${appDomain}`
    };
  }
};

const setDefaultSettings = async () => {
  const settings = await getSettings();
  if (settings) {
    mySettings.initialize({
      ...settings,
      isFromStore: isFromStore
    });
  } else {
    const language = await getSystemLanguage();
    const data = { language, opened: false, theme: 'light' };
    await createSettings(data);
    mySettings.initialize({
      ...data,
      isFromStore: isFromStore
    });
  }
};

const createOwnContact = async (name, email) => {
  const [prevOwnContact] = await getContactByEmails({ emails: [email] });
  if (prevOwnContact) {
    return;
  }
  try {
    await createContact({ contacts: [{ name, email }] });
  } catch (createContactDbError) {
    throw CustomError(string.errors.saveOwnContact);
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
    const res = await getKeyBundle({ deviceId, recipientId });
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
