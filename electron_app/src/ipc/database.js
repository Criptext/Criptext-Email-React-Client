const ipc = require('@criptext/electron-better-ipc');
const dbManager = require('./../DBManager');

ipc.answerRenderer('db-clean-database', () => dbManager.cleanDataBase());

ipc.answerRenderer('db-create-email', params => dbManager.createEmail(params));

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

ipc.answerRenderer('db-create-signed-prekey-record', params =>
  dbManager.createSignedPreKeyRecord(params)
);

ipc.answerRenderer('db-delete-email-by-keys', keys =>
  dbManager.deleteEmailByKeys(keys)
);

ipc.answerRenderer('db-delete-email-label', params =>
  dbManager.deleteEmailLabel(params)
);

ipc.answerRenderer('db-delete-emails-by-ids', params =>
  dbManager.deleteEmailsByIds(params)
);

ipc.answerRenderer(
  'db-delete-emails-by-threadid-and-labelid',
  ({ threadIds, labelId }) =>
    dbManager.deleteEmailsByThreadIdAndLabelId({ threadIds, labelId })
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

ipc.answerRenderer('db-get-all-contacts', () => dbManager.getAllContacts());

ipc.answerRenderer('db-get-all-feed-items', () => dbManager.getAllFeedItems());

ipc.answerRenderer('db-get-all-labels', () => dbManager.getAllLabels());

ipc.answerRenderer('db-get-email-by-key', key => dbManager.getEmailByKey(key));

ipc.answerRenderer('db-get-emails-by-ids', emailIds =>
  dbManager.getEmailsByIds(emailIds)
);

ipc.answerRenderer('db-get-emails-by-keys', emailKeys =>
  dbManager.getEmailsByKeys(emailKeys)
);

ipc.answerRenderer('db-get-emails-by-labelids', labelIds =>
  dbManager.getEmailsByLabelIds(labelIds)
);

ipc.answerRenderer('db-get-emails-by-threadid', threadId =>
  dbManager.getEmailsByThreadId(threadId)
);

ipc.answerRenderer(
  'db-get-emails-by-threadid-and-labelid',
  ({ threadIds, labelId }) =>
    dbManager.getEmailsByThreadIdAndLabelId({ threadIds, labelId })
);

ipc.answerRenderer('db-get-emails-counter-by-labelid', labelId =>
  dbManager.getEmailsCounterByLabelId(labelId)
);

ipc.answerRenderer('db-get-emails-group-by-thread-by-params', params =>
  dbManager.getEmailsGroupByThreadByParams(params)
);

ipc.answerRenderer('db-get-emails-unread-by-labelid', params =>
  dbManager.getEmailsUnredByLabelId(params)
);

ipc.answerRenderer('db-get-contact-by-emails', emails =>
  dbManager.getContactByEmails(emails)
);

ipc.answerRenderer('db-get-contact-by-ids', ids =>
  dbManager.getContactByIds(ids)
);

ipc.answerRenderer('db-get-files-by-emailid', emailId =>
  dbManager.getFilesByEmailId(emailId)
);

ipc.answerRenderer('db-get-filekey-by-emailid', emailId =>
  dbManager.getFileKeyByEmailId(emailId)
);

ipc.answerRenderer('db-get-identity-key-record', params =>
  dbManager.getIdentityKeyRecord(params)
);

ipc.answerRenderer('db-get-prekey-pair', params =>
  dbManager.getPreKeyPair(params)
);

ipc.answerRenderer('db-get-session-record', params =>
  dbManager.getSessionRecord(params)
);

ipc.answerRenderer('db-get-session-record-by-recipientids', recipientIds =>
  dbManager.getSessionRecordByRecipientIds(recipientIds)
);

ipc.answerRenderer('db-get-signed-prekey', params =>
  dbManager.getSignedPreKey(params)
);

ipc.answerRenderer('db-update-email', params => dbManager.updateEmail(params));

ipc.answerRenderer('db-update-identity-key-record', params =>
  dbManager.updateIdentityKeyRecord(params)
);
