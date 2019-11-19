const { ipcMain: ipc } = require('@criptext/electron-better-ipc');
const { app } = require('electron');
const unusedFilename = require('unused-filename');
const { download } = require('electron-dl');
const path = require('path');
const mailboxWindow = require('../windows/mailbox');
const { installUpdate, checkForUpdates } = require('./../updater');
const { showNotification } = require('./../notificationManager');
const myAccount = require('./../Account');
const wsClient = require('./../socketClient');
const { printEmailOrThread } = require('./../utils/PrintUtils');
const { buildEmailSource } = require('../utils/SourceUtils');
const {
  getUserEmailsPath,
  createIfNotExist,
  checkIfExists
} = require('../utils/FileUtils');
const { getUsername, genUUID } = require('./../utils/stringUtils');
const { showWindows } = require('./../windows/windowUtils');
const { restartSocket } = require('./../socketClient');
const { checkAlive } = require('./../reachabilityTask');
const { restartAlice } = require('./../aliceManager');

ipc.answerRenderer('close-mailbox', () => {
  mailboxWindow.close();
});

ipc.answerRenderer('install-update', () => {
  installUpdate();
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

ipc.answerRenderer('open-mailbox', ({ firstOpenApp }) => {
  wsClient.start(myAccount);
  mailboxWindow.show({ firstOpenApp });
});

ipc.answerRenderer('print-to-pdf', async ({ emailId, threadId }) => {
  await printEmailOrThread({ emailId, threadId });
});

ipc.answerRenderer('open-email-source', async metadataKey => {
  await buildEmailSource({ metadataKey });
});

ipc.answerRenderer(
  'fs-download-file',
  async ({ url, filename, downloadType, metadataKey }) => {
    const isInlineImage = downloadType === 'inline';
    try {
      const directory = await defineDownloadDirectory({
        downloadType,
        metadataKey
      });
      const filePath = path.join(directory, filename);
      if (!isInlineImage) {
        filename = path.basename(unusedFilename.sync(filePath));
      }
      const downloadedItem = await download(mailboxWindow.getWindow(), url, {
        directory,
        filename
      });
      const newFilePath = downloadedItem.getSavePath();
      return { filePath: newFilePath, filename };
    } catch (e) {
      if (!isInlineImage) {
        mailboxWindow.send('display-message-error-download');
        return {};
      }
    }
    if (!isInlineImage) mailboxWindow.showFileExplorer(filename);
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

ipc.answerRenderer(
  'fs-check-file-downloaded',
  async ({ filename, metadataKey, type }) => {
    const directory = await defineDownloadDirectory({
      downloadType: type,
      metadataKey
    });
    const filePath = path.join(directory, filename);
    return checkIfExists(filePath) ? filePath : null;
  }
);

ipc.answerRenderer('show-notification', ({ title, message, threadId }) => {
  const onClickNotification = () => {
    showWindows();
    if (threadId)
      mailboxWindow.send('open-thread-by-notification', { threadId });
  };
  showNotification({ title, message, clickHandler: onClickNotification });
});

ipc.answerRenderer('check-for-updates', showDialog => {
  checkForUpdates(showDialog);
});

ipc.answerRenderer('generate-label-uuid', genUUID);

ipc.answerRenderer('restart-connection', jwt => {
  restartSocket({ jwt });
  checkAlive(true);
});

ipc.answerRenderer('restart-alice', restartAlice);
