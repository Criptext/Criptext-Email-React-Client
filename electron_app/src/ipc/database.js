const ipc = require('@criptext/electron-better-ipc');
const dbManager = require('./../DBManager');

ipc.answerRenderer('db-create-email', params => dbManager.createEmail(params));

ipc.answerRenderer('db-create-email-label', params =>
  dbManager.createEmailLabel(params)
);

ipc.answerRenderer('db-create-identity-key-record', params =>
  dbManager.createIdentityKeyRecord(params)
);

ipc.answerRenderer('db-create-prekey-record', params =>
  dbManager.createPreKeyRecord(params)
);

ipc.answerRenderer('db-create-session-record', params =>
  dbManager.createSessionRecord(params)
);

ipc.answerRenderer('db-create-signed-prekey-record', params =>
  dbManager.createSignedPreKeyRecord(params)
);

ipc.answerRenderer('db-delete-emails-by-ids', params =>
  dbManager.deleteEmailsByIds(params)
);

ipc.answerRenderer('db-delete-prekey-pair', params =>
  dbManager.deletePreKeyPair(params)
);

ipc.answerRenderer('db-delete-session-record', params =>
  dbManager.deleteSessionRecord(params)
);

ipc.answerRenderer('db-get-account', () => dbManager.getAccount());

ipc.answerRenderer('db-get-all-contacts', () => dbManager.getAllContacts());

ipc.answerRenderer('db-get-email-by-key', key => dbManager.getEmailByKey(key));

ipc.answerRenderer('db-get-files-by-emailid', emailId =>
  dbManager.getFilesByEmailId(emailId)
);

ipc.answerRenderer('db-get-filekey-by-emailid', emailId =>
  dbManager.getFileKeyByEmailId(emailId)
);

ipc.answerRenderer('db-identity-key-record', params =>
  dbManager.getIdentityKeyRecord(params)
);
