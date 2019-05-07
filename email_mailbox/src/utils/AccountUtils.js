import { getTwoCapitalLetters } from './StringUtils';
import { avatarBaseUrl, appDomain } from './const';
import { getAccountByParams } from '../utils/ipc';

export const compareAccounts = (account1, account2) => {
  return (
    account2['isActive'] - account1['isActive'] ||
    account2['isLoggedIn'] - account1['isLoggedIn'] ||
    compareAccountName(account1.name, account2.name)
  );
};

const compareAccountName = (name1, name2) => {
  return name1 > name2 ? 1 : name1 < name2 ? -1 : 0;
};

export const defineAccounts = accounts => {
  return accounts.reduce((result, element) => {
    const account = {
      id: element.id,
      isActive: element.isActive,
      name: element.name,
      recipientId: element.recipientId
    };
    return {
      ...result,
      [element.id]: account
    };
  }, {});
};

export const loadAccounts = async () => {
  const accounts = await getAccountByParams({
    isLoggedIn: true
  });
  return defineAccounts(accounts);
};

export const defineAccountVisibleParams = (account, timestamp) => {
  const name = account.name;
  const recipientId = account.recipientId;
  const letters = getTwoCapitalLetters(name);
  const emailAddress = `${recipientId}@${appDomain}`;
  const avatarUrl = formAvatarUrl(recipientId, timestamp);
  const isActive = account.isActive || false;
  return {
    name,
    letters,
    emailAddress,
    avatarUrl,
    isActive
  };
};

export const formAvatarUrl = (recipientId, timestamp) => {
  return `${avatarBaseUrl}${recipientId}?date=${timestamp}`;
};
