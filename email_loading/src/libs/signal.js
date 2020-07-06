import {
  myAccount,
  mySettings,
  isFromStore
} from './../utils/electronInterface';
import {
  cleanDatabase,
  closeCreatingKeysLoadingWindow,
  createAlias,
  createContact,
  createCustomDomain,
  createSettings,
  deleteAliases,
  deleteCustomDomains,
  getAccountByParams,
  getAlias,
  getComputerName,
  getCustomDomain,
  getKeyBundle,
  postKeyBundle,
  postUser,
  updateAccount,
  updateAccountDefaultAddress,
  updateAlias,
  updateCustomDomain,
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
  customerType,
  addresses
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
  const { status, body, headers } = await postUser({
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
    const { error, data } = body;
    switch (error) {
      case 1: {
        openLoginWindow({
          code: postUserCodeError.CRIPTEXT_EMAIL_NOT_CONFIRMED,
          data: string.errors.criptext_email_not_confirmed
        });
        closeCreatingKeysLoadingWindow();
        break;
      }
      case 2: {
        openLoginWindow({
          code: postUserCodeError.EMAIL_MAX_REACHED,
          data: {
            description: string.formatString(
              string.errors.email_max_reached.description,
              data.max
            )
          }
        });
        closeCreatingKeysLoadingWindow();
        break;
      }
      case 3: {
        openLoginWindow({
          code: postUserCodeError.TEMPORAL_EMAIL,
          data: string.errors.temporal_email
        });
        closeCreatingKeysLoadingWindow();
        break;
      }
      default: {
        openLoginWindow({
          code: postUserCodeError.USER_FAILED,
          data: {
            name: string.errors.createUserFailed.name,
            description: string.errors.createUserFailed.description + status
          }
        });
        closeCreatingKeysLoadingWindow();
        break;
      }
    }
    return;
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
    closeCreatingKeysLoadingWindow();
    return;
  } else if (status !== 200) {
    openLoginWindow({
      code: postUserCodeError.USER_FAILED,
      data: {
        name: string.errors.createUserFailed.name,
        description: string.errors.createUserFailed.description + status
      }
    });
    closeCreatingKeysLoadingWindow();
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
  const newAccount = loggedAccounts.find(
    account => account.recipientId === recipientId
  );
  myAccount.initialize(loggedAccounts);
  if (!myAccount.id) {
    throw CustomError(string.errors.saveLocal);
  }
  await createOwnContact(name, myAccount.email, myAccount.id);
  await checkAddressesAndDomains(newAccount, addresses);
  return activeAccount
    ? {
        recipientId,
        accountId: newAccount.id
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
  customerType,
  addresses
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
  const newAccount = loggedAccounts.find(
    account => account.recipientId === recipientId
  );
  myAccount.initialize(loggedAccounts);
  if (!myAccount.id) {
    throw CustomError(string.errors.saveLocal);
  }
  const email = myAccount.email;
  await createOwnContact(name, email, myAccount.id);
  await checkAddressesAndDomains(newAccount, addresses);
  await setDefaultSettings();
  return activeAccount
    ? {
        recipientId,
        accountId: newAccount.id
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
  customerType,
  addresses
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
  const newAccount = loggedAccounts.find(
    account => account.recipientId === recipientId
  );
  myAccount.initialize(loggedAccounts);
  await createOwnContact(name, myAccount.email);
  await checkAddressesAndDomains(newAccount, addresses);
  if (activeAccount) {
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

const checkAddressesAndDomains = async (myAccount, addresses) => {
  if (!myAccount || !addresses || addresses.length <= 0) return;

  const aliasinDb = await getAlias({ accountId: myAccount.id });
  const customDomainsinDb = await getCustomDomain({ accountId: myAccount.id });
  let defaultAddressId = null;

  let aliasesInApi = addresses
    .map(address => {
      const domainName = address.domain.name;
      return address.aliases.map(alias => {
        if (alias.default) {
          defaultAddressId = alias.addressId;
        }
        return {
          name: alias.name,
          rowId: alias.addressId,
          active: alias.status ? true : false,
          domain: domainName
        };
      });
    })
    .flat();
  const domainsInApi = addresses
    .map(address => address.domain)
    .filter(domain => domain.name !== appDomain);
  const domainsToCreate = [];
  const domainsToUpdate = [];
  const myApiDomains = new Set();
  for (const apiDomain of domainsInApi) {
    myApiDomains.add(apiDomain.name);

    const localDomain = customDomainsinDb.find(
      domain => apiDomain.name === domain.name
    );
    if (!localDomain) {
      domainsToCreate.push({
        ...apiDomain,
        accountId: myAccount.accountId
      });
    } else if (localDomain.validated !== apiDomain.confirmed) {
      domainsToUpdate.push({
        name: localDomain.name,
        validated: apiDomain.confirmed,
        accountId: myAccount.id
      });
    }
  }
  const domainsToDelete = customDomainsinDb
    .filter(domain => !myApiDomains.has(domain.name))
    .map(domain => domain.name);

  const aliasesToUpdate = [];
  const aliasesToDelete = [];
  for (const localAlias of aliasinDb) {
    if (localAlias.domain !== appDomain && myApiDomains.has(localAlias.domain))
      continue;
    const apiAlias = aliasesInApi.find(
      alias => localAlias.rowId === alias.rowId
    );
    if (!apiAlias) {
      aliasesToDelete.push(localAlias.rowId);
    } else if (localAlias.active !== apiAlias.active) {
      aliasesToUpdate.push({
        rowId: localAlias.rowId,
        active: apiAlias.active,
        accountId: myAccount.id
      });
    }
    aliasesInApi = aliasesInApi.filter(
      alias => alias.rowId !== localAlias.rowId
    );
  }
  const aliasesToCreate = aliasesInApi.map(alias => ({
    ...alias,
    domain: alias.domain === appDomain ? null : alias.domain,
    accountId: myAccount.id
  }));

  if (myAccount.defaultAddressId !== defaultAddressId) {
    await updateAccountDefaultAddress({
      defaultAddressId,
      accountId: myAccount.id
    });
  }

  await Promise.all(
    [
      domainsToCreate.map(createCustomDomain),
      domainsToUpdate.map(updateCustomDomain),
      domainsToDelete.length > 0 ? deleteCustomDomains(domainsToDelete) : [],
      aliasesToCreate.map(createAlias),
      aliasesToUpdate.map(updateAlias),
      aliasesToDelete.length > 0
        ? deleteAliases({ rowIds: aliasesToDelete, accountId: myAccount.id })
        : []
    ].flat()
  );
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
