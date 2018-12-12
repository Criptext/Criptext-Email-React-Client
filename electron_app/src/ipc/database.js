const ipc = require('@criptext/electron-better-ipc');
const dbManager = require('./../DBManager');

ipc.answerRenderer('db-create-email', params => dbManager.createEmail(params));

ipc.answerRenderer('db-create-email-label', params =>
  dbManager.createEmailLabel(params)
);

ipc.answerRenderer('db-create-identity-key-record', params =>
  dbManager.createIdentityKeyRecord(params)
);

ipc.answerRenderer('db-create-pre-key-record', params =>
  dbManager.createPreKeyRecord(params)
);

ipc.answerRenderer('db-create-session-record', params =>
  dbManager.createSessionRecord(params)
);

ipc.answerRenderer('db-get-all-contacts', () => dbManager.getAllContacts());
