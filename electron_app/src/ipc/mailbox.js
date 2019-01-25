const ipc = require('@criptext/electron-better-ipc');
const { app, BrowserWindow } = require('electron');
const { download } = require('electron-dl');
const mailboxWindow = require('../windows/mailbox');
const { downloadUpdate } = require('./../updater');
const myAccount = require('./../Account');
const wsClient = require('./../socketClient');
const { printEmailOrThread } = require('./../utils/PrintUtils');
const { buildEmailSource } = require('../utils/SourceUtils');

ipc.answerRenderer('close-mailbox', () => {
  mailboxWindow.close();
});

ipc.answerRenderer('download-update', () => {
  downloadUpdate();
});

ipc.answerRenderer('logout-app', () => {
  app.relaunch();
  app.exit(0);
});

ipc.answerRenderer('maximize-mailbox', () => {
  mailboxWindow.toggleMaximize();
});

ipc.answerRenderer('minimize-mailbox', () => {
  mailboxWindow.minimize();
});

ipc.answerRenderer('open-file-explorer', filename => {
  mailboxWindow.showFileExplorer(filename);
});

ipc.answerRenderer('open-mailbox', () => {
  wsClient.start(myAccount);
  mailboxWindow.show();
});

ipc.answerRenderer('print-to-pdf', async ({ emailId, threadId }) => {
  await printEmailOrThread({ emailId, threadId });
});

ipc.answerRenderer('open-email-source', async metadataKey => {
  await buildEmailSource({ metadataKey });
});

ipc.answerRenderer('download-file', ({ url, filename, downloadType }) => {
  const directory = defineDownloadDirectory(downloadType);
  download(BrowserWindow.getFocusedWindow(), url, {
    directory,
    filename,
    openFolderWhenDone: true
  })
    .then(dl => {
      mailboxWindow.send('display-message-success-download');
      if (downloadType === 'inline') {
        return dl.getSavePath();
      }
    })
    .catch(err => {
      console.error(err);
      mailboxWindow.send('display-message-error-download');
    });
});

const defineDownloadDirectory = type => {
  const customDownloadPath = '/home/julian/Esritorio';
  if (type === 'inline') {
    return customDownloadPath;
  }
  return app.getPath('downloads');
};
