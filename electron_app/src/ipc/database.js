const ipc = require('@criptext/electron-better-ipc');
const dbManager = require('../DBManager');

ipc.answerRenderer('db-get-all-contacts', () => dbManager.getAllContacts());
