import { getTwoCapitalLetters } from './StringUtils';
import { LabelType, myAccount } from './electronInterface';
import { avatarBaseUrl, appDomain } from './const';
import { getEmailsUnredByLabelId } from './ipc';
import { isPlus } from './plus';

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
      badge: element.badge || 0,
      isActive: !!element.isActive,
      name: element.name,
      recipientId: element.recipientId,
      customerType: element.customerType
    };
    return {
      ...result,
      [element.id]: account
    };
  }, {});
};

export const defineBadgeAccounts = async (
  accounts = myAccount.inactiveAccounts
) => {
  const recipientIds = Object.keys(accounts);
  return await Promise.all(
    recipientIds.map(async recipientId => {
      const account = accounts[recipientId];
      const labelId = LabelType.inbox.id;
      const rejectedLabelIds = [LabelType.spam.id, LabelType.trash.id];
      const accountId = account.id;
      const badge = await getEmailsUnredByLabelId({
        labelId,
        rejectedLabelIds,
        accountId: account.id
      });
      return { id: accountId, badge };
    })
  );
};

export const defineAccountVisibleParams = (account, timestamp) => {
  const name = account.name;
  const recipientId = account.recipientId;
  const letters = getTwoCapitalLetters(name);
  const [username, domain = appDomain] = recipientId.split('@');
  const emailAddress = `${username}@${domain}`;
  const avatarUrl = formAvatarUrl(username, domain, timestamp);
  const isActive = account.isActive || false;
  const showPlusBorder = isPlus(account.customerType);
  return {
    name,
    letters,
    emailAddress,
    avatarUrl,
    isActive,
    showPlusBorder
  };
};

export const formAvatarUrl = (username, domain, timestamp) => {
  return `${avatarBaseUrl}${domain}/${username}?date=${timestamp}`;
};
