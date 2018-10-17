const { dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const notifier = require('node-notifier');
const path = require('path');
const globalManager = require('./globalManager');
const appId = 'com.criptext.criptextmail';

let currentUpdaterType;
let isDownloadingUpdate = false;
const updaterTypes = {
  AUTO: 'auto',
  MANUAL: 'manual',
  NONE: 'none'
};
const iconPath = path.join(__dirname, './../resources/launch-icons/icon.png');
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
      title: 'No Updates',
      message: 'Current version is up-to-date.',
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
        title: 'Update found',
        message:
          'A new version of Criptext is available. Do you want download it now?',
        buttons: ['Sure', 'No'],
        noLink: true
      },
      buttonIndex => {
        if (buttonIndex === 0) {
          autoUpdater.downloadUpdate();
          isDownloadingUpdate = true;
        }
      }
    );
  }
  if (currentUpdaterType === updaterTypes.AUTO) {
    const title = 'A new version of Criptext is available!';
    const message = 'Click here to download or dismiss to update later';
    const notifyOptions = {
      appName: appId,
      title,
      message,
      icon: iconPath,
      timeout: 15,
      wait: true
    };
    notifier.notify(notifyOptions);

    notifier.on('click', () => {
      const downloadingNotifyOptions = {
        appName: appId,
        title: 'Downloading update',
        message: "When it's ready we will notify you",
        icon: iconPath
      };
      notifier.notify(downloadingNotifyOptions);
      autoUpdater.downloadUpdate();
      isDownloadingUpdate = true;
    });
  }
});

autoUpdater.on('download-progress', data => {
  const { bytesPerSecond, percent, transferred, total } = data;
  const downloadStatus = `Downloading: ${percent}% - [${transferred}/${total}] - (${bytesPerSecond} b/s)`;
  if (process.env.DEBUG) {
    // To do
    console.log(downloadStatus);
  }
});

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox(
    {
      title: 'Install Update',
      message:
        'Update downloaded, application will be quit for install update...',
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

const appUpdaterWin = () => {
  currentUpdaterType = updaterTypes.AUTO;
  autoUpdater.checkForUpdates();
};

const appUpdaterMac = () => {
  currentUpdaterType = updaterTypes.AUTO;
  autoUpdater.checkForUpdatesAndNotify();
};

const appUpdaterLinux = () => {
  currentUpdaterType = updaterTypes.AUTO;
  autoUpdater.checkForUpdatesAndNotify();
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

module.exports = {
  checkForUpdates,
  appUpdaterMac,
  appUpdaterWin,
  appUpdaterLinux
};
