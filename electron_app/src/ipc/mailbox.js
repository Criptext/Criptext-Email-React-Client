const ipc = require('@criptext/electron-better-ipc');
const { app, BrowserWindow, shell } = require('electron');
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
  checkIfExists,
  getFilesizeInBytes
} = require('../utils/FileUtils');
const { getUsername, genUUID } = require('./../utils/stringUtils');
const { showWindows } = require('./../windows/windowUtils');
const { start, restartSocket } = require('./../socketClient');

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

ipc.answerRenderer('open-mailbox', params => {
  wsClient.start(myAccount);
  mailboxWindow.show(params);
});

ipc.answerRenderer('print-to-pdf', async ({ emailId, threadId }) => {
  await printEmailOrThread({ emailId, threadId });
});

ipc.answerRenderer('open-email-source', async params => {
  await buildEmailSource(params);
});

ipc.answerRenderer(
  'fs-download-file',
  async ({ url, filename, downloadType, metadataKey, filesize }) => {
    const openFolderWhenDone = downloadType !== 'inline';
    const shouldShowMessage = openFolderWhenDone;
    try {
      const directory = await defineDownloadDirectory({
        downloadType,
        metadataKey
      });
      const filePath = path.join(directory, filename);
      if (checkIfExists(filePath)) {
        if (downloadType === 'inline') return filePath;

        const previousFileSize = getFilesizeInBytes(filePath);
        if (previousFileSize === filesize) {
          shell.showItemInFolder(filePath);
          return;
        }
        filename = path.basename(unusedFilename.sync(filePath));
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

ipc.answerRenderer('restart-socket', async jwt => {
  await restartSocket({ jwt });
});

ipc.answerRenderer('start-socket', jwt => start({ jwt }));
