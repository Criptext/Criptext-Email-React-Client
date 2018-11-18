const { dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const notifier = require('node-notifier');
const path = require('path');
const globalManager = require('./globalManager');
const appId = 'com.criptext.emailclient';

let currentUpdaterType;
let isDownloadingUpdate = false;
const updaterTypes = {
  AUTO: 'auto',
  MANUAL: 'manual',
  NONE: 'none'
};
const iconPath = path.join(__dirname, './../resources/launch-icons/icon.png');
const notificationIconPath = path.join(
  __dirname,
  './../resources/notificationIcon.png'
);

autoUpdater.autoDownload = false;

autoUpdater.on('error', error => {
  const errorMessage = process.env.DEBUG
    ? error == null
      ? 'unknown'
      : (error.stack || error).toString()
    : 'An error occurred while downloading the update. Try again later.';
  dialog.showErrorBox('Error: ', errorMessage);
  currentUpdaterType = updaterTypes.NONE;
  isDownloadingUpdate = false;
});

autoUpdater.on('update-not-available', () => {
  if (currentUpdaterType === updaterTypes.MANUAL) {
    dialog.showMessageBox({
      title: 'No Update Available',
      message: "You're on the latest version of Criptext",
      buttons: ['Ok']
    });
  }
  currentUpdaterType = updaterTypes.NONE;
});

autoUpdater.on('update-available', () => {
  if (currentUpdaterType === updaterTypes.MANUAL) {
    dialog.showMessageBox(
      {
        type: 'info',
        title: 'Update Available',
        message:
          'A new version of Criptext is available. Would you like to download it now?',
        buttons: ['Sure', 'No'],
        noLink: true
      },
      buttonIndex => {
        if (buttonIndex === 0) {
          downloadUpdate();
        }
      }
    );
  }

  if (currentUpdaterType === updaterTypes.AUTO) {
    const mailboxWindow = require('./windows/mailbox');
    const isVisibleAndFocused = mailboxWindow.isVisibleAndFocused();
    if (isVisibleAndFocused) {
      mailboxWindow.send('update-available');
    } else {
      showNotification({
        title: 'A new version of Criptext is available!',
        message: 'Click here to download or dismiss to update later'
      });
      notifier.on('click', () => {
        showNotification({
          title: 'Downloading update',
          message: "When it's ready we will notify you"
        });
        downloadUpdate();
      });
    }
  }
});

autoUpdater.on('download-progress', data => {
  const { bytesPerSecond, percent, transferred, total } = data;
  const downloadStatus = `Downloading: ${percent}% - [${transferred}/${total}] - (${bytesPerSecond} b/s)`;
  if (process.env.NODE_ENV === 'development') {
    // To do
    console.log(downloadStatus);
  }
});

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox(
    {
      title: 'Install Update',
      message:
        'Update download complete. Criptext will restart and update immediately.',
      buttons: ['Ok']
    },
    () => {
      currentUpdaterType = updaterTypes.NONE;
      isDownloadingUpdate = false;
      setImmediate(() => {
        globalManager.forcequit.set(true);
        autoUpdater.quitAndInstall();
      });
    }
  );
});

const appUpdater = () => {
  currentUpdaterType = updaterTypes.AUTO;
  autoUpdater.checkForUpdates();
};

const checkForUpdates = () => {
  if (!isDownloadingUpdate) {
    currentUpdaterType = updaterTypes.MANUAL;
    autoUpdater.checkForUpdates();
  } else {
    dialog.showMessageBox({
      title: 'Downloading update',
      message: 'An update is currently being downloaded',
      buttons: ['Ok']
    });
  }
};

const downloadUpdate = () => {
  autoUpdater.downloadUpdate();
  isDownloadingUpdate = true;
};

const showNotification = ({ title, message }) => {
  const mailboxWindow = require('./windows/mailbox');
  const isVisibleAndFocused = mailboxWindow.isVisibleAndFocused();
  if (!isVisibleAndFocused) {
    const notifyOptions = {
      appName: appId,
      title,
      message,
      icon: iconPath,
      timeout: 15,
      wait: true
    };
    notifier.notify(notifyOptions);
  }
};

module.exports = {
  appUpdater,
  checkForUpdates,
  downloadUpdate,
  showNotification,
  iconPath
};
