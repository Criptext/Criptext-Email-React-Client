const ipc = require('@criptext/electron-better-ipc');
const dbManager = require('./../DBManager');

ipc.answerRenderer('db-create-email', params => dbManager.createEmail(params));

ipc.answerRenderer('db-create-email-label', params =>
  dbManager.createEmailLabel(params)
);

ipc.answerRenderer('db-get-all-contacts', () => dbManager.getAllContacts());
