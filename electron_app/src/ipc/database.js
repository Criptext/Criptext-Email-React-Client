const { ipcMain: ipc } = require('@criptext/electron-better-ipc');
const dbManager = require('./../database');
const accountId = 1;

ipc.answerRenderer('db-migrate-alice', () => dbManager.cleanForAlice());

ipc.answerRenderer('db-clean-data-logout', recipientId =>
  dbManager.cleanDataLogout(recipientId)
);

ipc.answerRenderer('db-create-contact', params =>
  dbManager.createContact(params)
);

ipc.answerRenderer('db-create-email-label', params => {
  const data = params.accountId ? params : { ...params, accountId };
  return dbManager.createEmailLabel(data);
});

ipc.answerRenderer('db-create-feed-item', params =>
  dbManager.createFeedItem(params)
);

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

ipc.answerRenderer('db-create-settings', params =>
  dbManager.createSettings(params)
);

ipc.answerRenderer('db-create-signed-prekey-record', params =>
  dbManager.createSignedPreKeyRecord(params)
);

ipc.answerRenderer('db-create-tables', () => dbManager.createTables());

ipc.answerRenderer('db-delete-email-label', params => {
  const data = params.accountId ? params : { ...params, accountId };
  return dbManager.deleteEmailLabel(data);
});

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

ipc.answerRenderer('db-get-account-by-params', params =>
  dbManager.getAccountByParams(params)
);

ipc.answerRenderer('db-get-all-contacts', () => dbManager.getAllContacts());

ipc.answerRenderer('db-get-all-feed-items', () => dbManager.getAllFeedItems());

ipc.answerRenderer('db-get-all-labels', () => dbManager.getAllLabels());

ipc.answerRenderer('db-get-contact-by-emails', emails =>
  dbManager.getContactByEmails(emails)
);

ipc.answerRenderer('db-get-contact-by-emailid', emailId =>
  dbManager.getContactsByEmailId(emailId)
);

ipc.answerRenderer('db-get-contact-by-ids', ids =>
  dbManager.getContactByIds(ids)
);

ipc.answerRenderer('db-get-email-by-key', params => {
  const data = params.accountId ? params : { ...params, accountId };
  return dbManager.getEmailByKey(data);
});

ipc.answerRenderer('db-get-email-by-params', params => {
  const data = params.accountId ? params : { ...params, accountId };
  return dbManager.getEmailByParams(data);
});

ipc.answerRenderer('db-get-emails-by-array-param', params => {
  const data = params.accountId ? params : { ...params, accountId };
  return dbManager.getEmailsByArrayParam(data);
});

ipc.answerRenderer('db-get-emails-by-labelids', params => {
  const data = params.accountId ? params : { ...params, accountId };
  return dbManager.getEmailsByLabelIds(data);
});

ipc.answerRenderer('db-get-emails-by-threadid-and-labelid', params => {
  const data = params.accountId ? params : { ...params, accountId };
  return dbManager.getEmailsByThreadIdAndLabelId(data);
});

ipc.answerRenderer('db-get-emails-counter-by-labelid', params => {
  const data = params.accountId ? params : { ...params, accountId };
  return dbManager.getEmailsCounterByLabelId(data);
});

ipc.answerRenderer('db-get-emails-group-by-thread-by-params', params => {
  const data = params.accountId ? params : { ...params, accountId };
  return dbManager.getEmailsGroupByThreadByParams(data);
});

ipc.answerRenderer('db-get-email-labels-by-emailid', emailId =>
  dbManager.getEmailLabelsByEmailId(emailId)
);

ipc.answerRenderer('db-get-emails-unread-by-labelid', params => {
  const data = params.accountId ? params : { ...params, accountId };
  return dbManager.getEmailsUnredByLabelId(data);
});

ipc.answerRenderer('db-get-feeditems-counter-by-seen', seen =>
  dbManager.getFeedItemsCounterBySeen(seen)
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

ipc.answerRenderer('db-get-labesls-by-text', text =>
  dbManager.getLabelsByText(text)
);

ipc.answerRenderer('db-get-label-by-uuid', dbManager.getLabelByUuid);

ipc.answerRenderer('db-get-prekey-pair', params =>
  dbManager.getPreKeyPair(params)
);

ipc.answerRenderer('db-get-prekeys-ids', () => dbManager.getPreKeyRecordIds());

ipc.answerRenderer('db-get-session-record', params =>
  dbManager.getSessionRecord(params)
);

ipc.answerRenderer('db-get-session-record-by-recipientids', recipientIds =>
  dbManager.getSessionRecordByRecipientIds(recipientIds)
);

ipc.answerRenderer('db-get-signed-prekey', params =>
  dbManager.getSignedPreKey(params)
);

ipc.answerRenderer('db-get-trash-expired-emails', () =>
  dbManager.getTrashExpiredEmails(accountId)
);

ipc.answerRenderer('db-update-account', params =>
  dbManager.updateAccount(params)
);

ipc.answerRenderer('db-update-contact-by-email', ({ email, name }) =>
  dbManager.updateContactByEmail({ email, name })
);

ipc.answerRenderer('db-update-contact-spam-acore', params =>
  dbManager.updateContactSpamScore(params)
);

ipc.answerRenderer('db-update-email', params => {
  const data = params.accountId ? params : { ...params, accountId };
  return dbManager.updateEmail(data);
});

ipc.answerRenderer('db-update-emails', params => {
  const data = params.accountId ? params : { ...params, accountId };
  return dbManager.updateEmails(data);
});

ipc.answerRenderer('db-update-feed-items', params =>
  dbManager.updateFeedItems(params)
);

ipc.answerRenderer('db-update-files-by-emailid', ({ emailId, status }) =>
  dbManager.updateFilesByEmailId({ emailId, status })
);

ipc.answerRenderer('db-update-identity-key-record', params =>
  dbManager.updateIdentityKeyRecord(params)
);

ipc.answerRenderer('db-update-label', params => dbManager.updateLabel(params));

ipc.answerRenderer('db-update-settings', params =>
  dbManager.updateSettings(params)
);

ipc.answerRenderer('db-update-unread-email-by-threadids', params => {
  const data = params.accountId ? params : { ...params, accountId };
  return dbManager.updateUnreadEmailByThreadIds(data);
});
