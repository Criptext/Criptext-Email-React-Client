const ipc = require('@criptext/electron-better-ipc');
const dbManager = require('./../DBManager');

ipc.answerRenderer('db-get-all-contacts', () => dbManager.getAllContacts());

ipc.answerRenderer('db-create-email', params => dbManager.createEmail(params));
