import { getTwoCapitalLetters } from './StringUtils';
import { LabelType } from './electronInterface';
import { avatarBaseUrl, appDomain } from './const';
import { getEmailsUnredByLabelId } from './ipc';

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
      badge: element.badge,
      isActive: !!element.isActive,
      name: element.name,
      recipientId: element.recipientId
    };
    return {
      ...result,
      [element.id]: account
    };
  }, {});
};

export const assembleAccounts = async accounts => {
  return await Promise.all(
    accounts.map(async account => {
      const labelId = LabelType.inbox.id;
      const rejectedLabelIds = [LabelType.spam.id, LabelType.trash.id];
      const unreadInbox = await getEmailsUnredByLabelId({
        labelId,
        rejectedLabelIds,
        accountId: account.id
      });
      const badgeInbox = unreadInbox.length;
      return { ...account, badge: badgeInbox };
    })
  );
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
