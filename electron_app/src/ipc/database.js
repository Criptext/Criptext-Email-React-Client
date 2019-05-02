const ipc = require('@criptext/electron-better-ipc');
const dbManager = require('./../DBManager');
const fileUtils = require('./../utils/FileUtils');
const { APP_DOMAIN } = require('./../utils/const');

ipc.answerRenderer('db-clean-data-logout', ({ recipientId, deleteAll }) =>
  dbManager.cleanDataLogout({ recipientId, deleteAll })
);

ipc.answerRenderer('db-create-account', params =>
  dbManager.createAccount(params)
);

ipc.answerRenderer('db-create-contact', params =>
  dbManager.createContact(params)
);

ipc.answerRenderer('db-create-email-label', params =>
  dbManager.createEmailLabel(params)
);

ipc.answerRenderer('db-create-feed-item', params =>
  dbManager.createFeedItem(params)
);

ipc.answerRenderer('db-create-file', params => dbManager.createFile(params));

ipc.answerRenderer('db-create-identity-key-record', params =>
  dbManager.createIdentityKeyRecord(params)
);

ipc.answerRenderer('db-create-label', params => dbManager.createLabel(params));

ipc.answerRenderer('db-create-prekey-record', params =>
  dbManager.createPreKeyRecord(params)
);

ipc.answerRenderer('db-create-session-record', params =>
  dbManager.createSessionRecord(params)
);

ipc.answerRenderer('db-create-signal-tables', () =>
  dbManager.createSignalTables()
);

ipc.answerRenderer('db-create-signed-prekey-record', params =>
  dbManager.createSignedPreKeyRecord(params)
);

ipc.answerRenderer('db-create-tables', () => dbManager.createTables());

ipc.answerRenderer('db-delete-email-label', params =>
  dbManager.deleteEmailLabel(params)
);

ipc.answerRenderer('db-delete-feed-item-by-id', feedItemId =>
  dbManager.deleteFeedItemById(feedItemId)
);

ipc.answerRenderer('db-delete-label-by-id', labelId =>
  dbManager.deleteLabelById(labelId)
);

ipc.answerRenderer('db-delete-prekey-pair', params =>
  dbManager.deletePreKeyPair(params)
);

ipc.answerRenderer('db-delete-session-record', params =>
  dbManager.deleteSessionRecord(params)
);

ipc.answerRenderer('db-get-account', () => dbManager.getAccount());

ipc.answerRenderer('db-delete-account-by-params', async params => {
  const accounts = await dbManager.getAccountByParams(params);
  if (!accounts.length) return;
  for (const account of accounts) {
    const username = `${account.recipientId}@${APP_DOMAIN}`;
    await fileUtils.removeUserDir(username);
  }
  return await dbManager.deleteAccountByParams(params);
});

ipc.answerRenderer('db-get-account-by-params', params =>
  dbManager.getAccountByParams(params)
);

ipc.answerRenderer('db-get-all-contacts', accountId =>
  dbManager.getAllContacts(accountId)
);

ipc.answerRenderer('db-get-all-feed-items', () => dbManager.getAllFeedItems());

ipc.answerRenderer('db-get-all-labels', accountId =>
  dbManager.getAllLabels(accountId)
);

ipc.answerRenderer('db-get-contact-by-emails', params =>
  dbManager.getContactByEmails(params)
);

ipc.answerRenderer('db-get-contact-by-emailid', emailId =>
  dbManager.getContactsByEmailId(emailId)
);

ipc.answerRenderer('db-get-contact-by-ids', ids =>
  dbManager.getContactByIds(ids)
);

ipc.answerRenderer('db-get-email-by-key', params =>
  dbManager.getEmailByKey(params)
);

ipc.answerRenderer('db-get-emails-by-ids', emailIds =>
  dbManager.getEmailsByIds(emailIds)
);

ipc.answerRenderer('db-get-emails-by-keys', params =>
  dbManager.getEmailsByKeys(params)
);

ipc.answerRenderer('db-get-emails-by-labelids', params =>
  dbManager.getEmailsByLabelIds(params)
);

ipc.answerRenderer(
  'db-get-emails-by-threadid-and-labelid',
  ({ threadIds, labelId, accountId }) =>
    dbManager.getEmailsByThreadIdAndLabelId({ threadIds, labelId, accountId })
);

ipc.answerRenderer('db-get-emails-counter-by-labelid', labelId =>
  dbManager.getEmailsCounterByLabelId(labelId)
);

ipc.answerRenderer('db-get-emails-group-by-thread-by-params', params =>
  dbManager.getEmailsGroupByThreadByParams(params)
);

ipc.answerRenderer('db-get-email-labels-by-emailid', emailId =>
  dbManager.getEmailLabelsByEmailId(emailId)
);

ipc.answerRenderer('db-get-emails-unread-by-labelid', params =>
  dbManager.getEmailsUnredByLabelId(params)
);

ipc.answerRenderer('db-get-files-by-emailid', emailId =>
  dbManager.getFilesByEmailId(emailId)
);

ipc.answerRenderer('db-get-files-by-tokens', tokens =>
  dbManager.getFilesByTokens(tokens)
);

ipc.answerRenderer('db-get-identity-key-record', params =>
  dbManager.getIdentityKeyRecord(params)
);

ipc.answerRenderer('db-get-labelid', id => dbManager.getLabelById(id));

ipc.answerRenderer('db-get-labesls-by-text', params =>
  dbManager.getLabelsByText(params)
);

ipc.answerRenderer('db-get-prekey-pair', params =>
  dbManager.getPreKeyPair(params)
);

ipc.answerRenderer('db-get-prekeys-ids', accountId =>
  dbManager.getPreKeyRecordIds(accountId)
);

ipc.answerRenderer('db-get-session-record', params =>
  dbManager.getSessionRecord(params)
);

ipc.answerRenderer(
  'db-get-session-record-by-recipientids',
  ({ recipientIds, accountId }) =>
    dbManager.getSessionRecordByRecipientIds({ recipientIds, accountId })
);

ipc.answerRenderer('db-get-signed-prekey', params =>
  dbManager.getSignedPreKey(params)
);

ipc.answerRenderer('db-get-trash-expired-emails', () =>
  dbManager.getTrashExpiredEmails()
);

ipc.answerRenderer('db-update-account', params =>
  dbManager.updateAccount(params)
);

ipc.answerRenderer('db-update-contact-by-email', ({ email, name }) =>
  dbManager.updateContactByEmail({ email, name })
);

ipc.answerRenderer('db-update-email', params => dbManager.updateEmail(params));

ipc.answerRenderer('db-update-emails', params =>
  dbManager.updateEmails(params)
);

ipc.answerRenderer('db-update-feed-item', ({ feedItemId, seen }) =>
  dbManager.updateFeedItem({ feedItemId, seen })
);

ipc.answerRenderer('db-update-files-by-emailid', ({ emailId, status }) =>
  dbManager.updateFilesByEmailId({ emailId, status })
);

ipc.answerRenderer('db-update-identity-key-record', params =>
  dbManager.updateIdentityKeyRecord(params)
);

ipc.answerRenderer('db-update-label', params => dbManager.updateLabel(params));

ipc.answerRenderer('db-update-settings', ({ opened, language, theme }) =>
  dbManager.updateSettings({ opened, language, theme })
);

ipc.answerRenderer(
  'db-update-unread-email-by-threadids',
  ({ threadIds, unread, accountId }) =>
    dbManager.updateUnreadEmailByThreadIds({ threadIds, unread, accountId })
);
