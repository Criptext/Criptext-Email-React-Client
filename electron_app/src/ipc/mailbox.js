const ipc = require('@criptext/electron-better-ipc');
const { app } = require('electron');
const mailboxWindow = require('../windows/mailbox');
const { downloadUpdate } = require('./../updater');
const { initAccount } = require('./../../electron-starter');

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
  initAccount();
  mailboxWindow.show();
});
