const { dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const notifier = require('node-notifier');
const path = require('path');
const globalManager = require('./globalManager');
const appId = 'com.criptext.criptextmail';
const { updaterMessages } = require('./lang').strings;

let currentUpdaterType;
let isDownloadingUpdate = false;
const updaterTypes = {
  AUTO: 'auto',
  MANUAL: 'manual',
  NONE: 'none'
};
const iconPath = path.join(__dirname, './../resources/launch-icons/icon.png');

autoUpdater.autoDownload = false;

autoUpdater.on('error', updaterError => {
  try {
    const isNetworkError = updaterError.stack
      .toString()
      .includes('ERR_INTERNET_DISCONNECTED');
    if (!isNetworkError) {
      throw updaterError;
    }
  } catch (error) {
    const errorMessage = process.env.DEBUG
      ? error == null
        ? updaterMessages.unknownError
        : (error.stack || error).toString()
      : updaterMessages.error.description;
    dialog.showErrorBox(updaterMessages.error.name, errorMessage);
    currentUpdaterType = updaterTypes.NONE;
    isDownloadingUpdate = false;
  }
});

autoUpdater.on('update-not-available', () => {
  if (currentUpdaterType === updaterTypes.MANUAL) {
    dialog.showMessageBox({
      title: updaterMessages.notAvailable.name,
      message: updaterMessages.notAvailable.description,
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
        title: updaterMessages.availableManual.name,
        message: updaterMessages.availableManual.description,
        buttons: [
          updaterMessages.availableManual.confirmButton,
          updaterMessages.availableManual.cancelButton
        ],
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
      downloadUpdate();
    } else {
      showNotification({
        title: updaterMessages.availableAuto.title,
        message: updaterMessages.availableAuto.subtitle
      });
      notifier.on('click', () => {
        showNotification({
          title: updaterMessages.downloading.title,
          message: updaterMessages.downloading.subtitle
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
  const mailboxWindow = require('./windows/mailbox');
  if (currentUpdaterType === updaterTypes.MANUAL) {
    dialog.showMessageBox(
      {
        title: updaterMessages.downloaded.title,
        message: updaterMessages.downloaded.subtitle,
        buttons: ['Ok']
      },
      () => {
        installUpdate();
      }
    );
  }

  if (currentUpdaterType === updaterTypes.AUTO) {
    mailboxWindow.send('update-available');
  }
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
      title: updaterMessages.alreadyDownloading.title,
      message: updaterMessages.alreadyDownloading.subtitle,
      buttons: ['Ok']
    });
  }
};

const downloadUpdate = () => {
  autoUpdater.downloadUpdate();
  isDownloadingUpdate = true;
};

const installUpdate = () => {
  currentUpdaterType = updaterTypes.NONE;
  isDownloadingUpdate = false;
  setImmediate(() => {
    globalManager.forcequit.set(true);
    autoUpdater.quitAndInstall();
  });
};

const showNotification = ({ title, message }) => {
  const mailboxWindow = require('./windows/mailbox');
  const isVisibleAndFocused = mailboxWindow.isVisibleAndFocused();
  const isMAS = globalManager.isMAS.get();
  if (!isMAS && !isVisibleAndFocused) {
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
  installUpdate,
  showNotification,
  iconPath
};
