const ipc = require('@criptext/electron-better-ipc');
const { app } = require('electron');
const mailboxWindow = require('../windows/mailbox');
const { downloadUpdate } = require('./../updater');
const myAccount = require('./../Account');
const wsClient = require('./../socketClient');

ipc.answerRenderer('download-update', () => {
  downloadUpdate();
});

ipc.answerRenderer('logout-app', () => {
  app.relaunch();
  app.exit(0);
});

ipc.answerRenderer('open-file-explorer', filename => {
  mailboxWindow.showFileExplorer(filename);
});

ipc.answerRenderer('open-mailbox', () => {
  wsClient.start(myAccount);
  mailboxWindow.show();
});
