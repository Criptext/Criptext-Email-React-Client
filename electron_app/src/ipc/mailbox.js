const ipc = require('@criptext/electron-better-ipc');
const { app, BrowserWindow } = require('electron');
const { download } = require('electron-dl');
const path = require('path');
const mailboxWindow = require('../windows/mailbox');
const { downloadUpdate } = require('./../updater');
const myAccount = require('./../Account');
const wsClient = require('./../socketClient');
const { printEmailOrThread } = require('./../utils/PrintUtils');
const { buildEmailSource } = require('../utils/SourceUtils');
const {
  getUserEmailsPath,
  createIfNotExist,
  checkIfExists
} = require('../utils/FileUtils');
const { getUsername } = require('./../utils/stringUtils');

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

ipc.answerRenderer(
  'download-file',
  async ({ url, filename, downloadType, metadataKey }) => {
    const openFolderWhenDone = downloadType !== 'inline';
    const shouldShowMessage = openFolderWhenDone;
    try {
      const directory = await defineDownloadDirectory({
        downloadType,
        metadataKey
      });
      const filePath = path.join(directory, filename);
      if (checkIfExists(filePath)) {
        console.log('Ya existe. No se descarga. ', filePath);
        return filePath;
      }
      const downloadedItem = await download(
        BrowserWindow.getFocusedWindow(),
        url,
        {
          directory,
          filename,
          openFolderWhenDone
        }
      );
      return downloadedItem.getSavePath();
    } catch (e) {
      console.log(e);
      if (shouldShowMessage)
        mailboxWindow.send('display-message-error-download');
    }
  }
);

const defineDownloadDirectory = async ({ downloadType, metadataKey }) => {
  if (downloadType === 'inline') {
    const username = getUsername();
    const myPath = await getUserEmailsPath(process.env.NODE_ENV, username);
    const emailPath = `${myPath}/${metadataKey}`;
    await createIfNotExist(emailPath);
    return emailPath;
  }
  return app.getPath('downloads');
};
