const { app, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const globalManager = require('./globalManager');
const { showNotification } = require('./notificationManager');
const { updaterMessages } = require('./lang').strings;

app.setAppUserModelId('com.criptext.criptextmail');

let currentUpdaterType;
let showUpdateDialogs = true;
let isDownloadingUpdate = false;
const updaterTypes = {
  AUTO: 'auto',
  MANUAL: 'manual',
  NONE: 'none'
};

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
    if (showUpdateDialogs) {
      dialog.showErrorBox(updaterMessages.error.name, errorMessage);
    }
    currentUpdaterType = updaterTypes.NONE;
    isDownloadingUpdate = false;
  }
});

autoUpdater.on('update-not-available', () => {
  if (currentUpdaterType === updaterTypes.MANUAL && showUpdateDialogs) {
    dialog.showMessageBox({
      title: updaterMessages.notAvailable.name,
      message: updaterMessages.notAvailable.description,
      buttons: ['Ok']
    });
  }
  currentUpdaterType = updaterTypes.NONE;
  showUpdateDialogs = true;
});

autoUpdater.on('update-available', () => {
  if (currentUpdaterType === updaterTypes.MANUAL) {
    if (!showUpdateDialogs) {
      downloadUpdate();
    } else {
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
  }

  if (currentUpdaterType === updaterTypes.AUTO) {
    const mailboxWindow = require('./windows/mailbox');
    const isVisibleAndFocused = mailboxWindow.isVisibleAndFocused();
    if (isVisibleAndFocused) {
      downloadUpdate();
    } else {
      showNotification({
        title: updaterMessages.availableAuto.title,
        message: updaterMessages.availableAuto.subtitle,
        clickHandler: () => {
          downloadUpdate();
          showNotification({
            title: updaterMessages.downloading.title,
            message: updaterMessages.downloading.subtitle,
            closeOnClick: true
          });
        }
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
  isDownloadingUpdate = false;
  const mailboxWindow = require('./windows/mailbox');
  if (currentUpdaterType === updaterTypes.MANUAL) {
    if (showUpdateDialogs) {
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
    } else {
      mailboxWindow.send('update-available');
      currentUpdaterType = updaterTypes.NONE;
      showUpdateDialogs = true;
    }
  }

  if (currentUpdaterType === updaterTypes.AUTO) {
    mailboxWindow.send('update-available');
  }
});

const appUpdater = () => {
  currentUpdaterType = updaterTypes.AUTO;
  autoUpdater.checkForUpdates();
};

const checkForUpdates = showDialog => {
  if (!isDownloadingUpdate) {
    currentUpdaterType = updaterTypes.MANUAL;
    showUpdateDialogs = typeof showDialog === 'boolean' ? showDialog : true;

    autoUpdater.checkForUpdates();
  } else if (isDownloadingUpdate && showUpdateDialogs) {
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

module.exports = {
  appUpdater,
  checkForUpdates,
  installUpdate
};
