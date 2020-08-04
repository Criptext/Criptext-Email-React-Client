import {
  aliceRequestWrapper,
  createAccountCredentials,
  generateKeyBundle
} from '../utils/EncryptionServiceUtils';
import {
  postUser,
  getAccountByParams,
  cleanDatabase,
  getComputerName,
  updateAccount,
  getContactByEmails,
  createContact
} from '../utils/ipc';
import { myAccount } from '../utils/electronInterface';

export const createAccount = async ({
  recipientId,
  password,
  name,
  recoveryEmail
}) => {
  const [activeAccount] = await getAccountByParams({
    isActive: true
  });

  await clearOtherAccounts(recipientId);

  const keybundle = await createAccountAndGetKeyBundle({
    recipientId,
    name,
    deviceType: 1,
    deviceId: 1
  });

  const { token, refreshToken } = await postKeyBundle({
    recipientId,
    password,
    name,
    recoveryEmail,
    keybundle
  });

  const newAccount = await prepareAccount({
    recipientId,
    refreshToken,
    token,
    activeAccount,
    name
  });

  return newAccount;
};

const createAccountAndGetKeyBundle = async ({
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
    throw new Error('Cant create account');
  }
  const keybundleRes = await aliceRequestWrapper(() => {
    return generateKeyBundle({ recipientId });
  });
  if (!keybundleRes || keybundleRes.status !== 200) {
    throw new Error('Cant create keybundle');
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

const clearOtherAccounts = async recipientId => {
  const accounts = (await getAccountByParams({
    isLoggedIn: 0
  })).filter(acc => acc.recipientId !== recipientId);
  let acc;
  for (acc of accounts) {
    await cleanDatabase(acc.recipientId);
  }
};

const postKeyBundle = async ({
  recipientId,
  password,
  name,
  recoveryEmail,
  keybundle
}) => {
  console.log(recipientId, password, name, recoveryEmail, keybundle);
  const res = await postUser({
    recipientId,
    password,
    name,
    recoveryEmail,
    keybundle
  });
  if (!res) {
    throw new Error('Empty Response');
  }

  const { status, body, headers } = res;
  switch (status) {
    case 400:
      throw new Error('Already Exists');
    case 405: {
      const { error } = body;
      switch (error) {
        case 1:
          throw new Error('Not Confirmed');
        case 2:
          throw new Error('Max Reached');
        case 3:
          throw new Error('Temporal Email');
        default:
          throw new Error(`Recovery Failure ${error}`);
      }
    }
    case 429: {
      const seconds = headers['retry-after'];
      throw new Error(`RETRY AFTER ${seconds}`);
    }
    case 200:
      break;
    default:
      throw new Error(`UKNOWN ERROR ${status}`);
  }
  return body;
};

const prepareAccount = async ({
  recipientId,
  refreshToken,
  token,
  activeAccount,
  name
}) => {
  await updateAccount({
    recipientId,
    refreshToken,
    jwt: token,
    isLoggedIn: true,
    isActive: !activeAccount,
    customerType: 1
  });

  const loggedAccounts = await getAccountByParams({
    isLoggedIn: true
  });

  const newAccount = loggedAccounts.find(
    account => account.recipientId === recipientId
  );

  myAccount.initialize(loggedAccounts);
  if (!myAccount.id) {
    throw new Error('Cant update locally');
  }

  await createOwnContact(name, myAccount.email, myAccount.id);
  return {
    recipientId,
    accountId: newAccount.id
  };
};

const createOwnContact = async (name, email) => {
  const [prevOwnContact] = await getContactByEmails({ emails: [email] });
  if (prevOwnContact) {
    return;
  }
  try {
    await createContact({ contacts: [{ name, email }] });
  } catch (createContactDbError) {
    throw new Error('Cant store myself');
  }
};
