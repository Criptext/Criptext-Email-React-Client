const ipc = require('@criptext/electron-better-ipc');
const { app, dialog, shell } = require('electron');
const {
  getComputerName,
  isWindows,
  getOsAndArch
} = require('../utils/osUtils');
const { processEventsQueue } = require('../eventQueueManager');
const globalManager = require('./../globalManager');
const loadingWindow = require('./../windows/loading');
const {
  getSystemLanguage,
  sendEventToAllWindows
} = require('./../windows/windowUtils');
const {
  createDefaultBackupFolder,
  getDefaultBackupFolder,
  prepareBackupFiles,
  exportBackupUnencrypted,
  exportBackupEncrypted,
  restoreUnencryptedBackup,
  restoreEncryptedBackup
} = require('./../BackupManager');
const { showNotification } = require('./../notificationManager');

ipc.answerRenderer('get-system-language', () => getSystemLanguage());

ipc.answerRenderer('get-computer-name', () => getComputerName());

ipc.answerRenderer('get-isWindows', () => isWindows());

ipc.answerRenderer('get-os-and-arch', () => getOsAndArch());

ipc.answerRenderer('process-pending-events', () => {
  processEventsQueue();
});

ipc.answerRenderer('throwError', ({ name, description }) => {
  dialog.showErrorBox(name, description);
});

ipc.answerRenderer('update-dock-badge', value => {
  const currentBadge = app.getBadgeCount();
  if (currentBadge !== value) {
    app.setBadgeCount(value);
  }
});

// Link devices
ipc.answerRenderer('start-link-devices-event', data => {
  sendLinkDeviceStartEventToAllWindows(data);
});

ipc.answerRenderer('end-link-devices-event', data => {
  sendLinkDeviceEndEventToAllWindows(data);
});

const sendLinkDeviceStartEventToAllWindows = async data => {
  const clientManager = require('./../clientManager');
  globalManager.windowsEvents.disable();
  sendEventToAllWindows('disable-window-link-devices');
  globalManager.loadingData.set({
    loadingType: 'link-device-request',
    remoteData: data.params.newDeviceInfo
  });
  loadingWindow.show();
  return await clientManager.acknowledgeEvents([data.rowid]);
};

const sendLinkDeviceEndEventToAllWindows = () => {
  globalManager.windowsEvents.enable();
  sendEventToAllWindows('enable-window-link-devices');
};

// Sync Mailbox
ipc.answerRenderer('start-sync-mailbox-event', data => {
  sendSyncMailboxStartEventToAllWindows(data);
});

ipc.answerRenderer('end-sync-mailbox-event', () => {
  sendLinkDeviceEndEventToAllWindows();
});

const sendSyncMailboxStartEventToAllWindows = async data => {
  const clientManager = require('./../clientManager');
  globalManager.windowsEvents.disable();
  sendEventToAllWindows('disable-window-link-devices');
  globalManager.loadingData.set({
    loadingType: 'sync-mailbox-request',
    remoteData: Object.assign(data.params.requestingDeviceInfo, {
      randomId: data.params.randomId,
      version: data.params.version
    })
  });
  loadingWindow.show();
  return await clientManager.acknowledgeEvents([data.rowid]);
};

// Backup
const simulatePause = ms => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

const commitBackupStatus = (eventName, status, params) => {
  sendEventToAllWindows(eventName, params);
  if (status) globalManager.backupStatus = status;
};

ipc.answerRenderer('create-default-backup-folder', () =>
  createDefaultBackupFolder()
);

ipc.answerRenderer('export-backup-unencrypted', async params => {
  const { backupPath, notificationParams } = params;
  try {
    globalManager.windowsEvents.disable();
    commitBackupStatus('local-backup-disable-events', 1);
    await prepareBackupFiles({});
    await simulatePause(2000);
    globalManager.windowsEvents.enable();
    commitBackupStatus('local-backup-enable-events', 2);
    await exportBackupUnencrypted({ backupPath });
    commitBackupStatus('local-backup-export-finished', 3);
    await simulatePause(3000);
    commitBackupStatus('local-backup-success', null);
    showNotification({
      title: notificationParams.success.title,
      message: notificationParams.success.message,
      clickHandler: function () {
        shell.showItemInFolder(backupPath)
      },
      forceToShow: true
    });
  } catch (error) {
    globalManager.windowsEvents.enable();
    commitBackupStatus('local-backup-enable-events', null, { error });
    showNotification({
      title: notificationParams.error.title,
      message: notificationParams.error.message,
      forceToShow: true
    });
  }
});

ipc.answerRenderer('export-backup-encrypted', async params => {
  const { backupPath, password, notificationParams } = params;
  try {
    globalManager.windowsEvents.disable();
    commitBackupStatus('local-backup-disable-events', 1);
    await prepareBackupFiles({});
    await simulatePause(2000);
    globalManager.windowsEvents.enable();
    commitBackupStatus('local-backup-enable-events', 2);
    await exportBackupEncrypted({
      backupPath,
      password
    });
    commitBackupStatus('local-backup-export-finished', 3);
    await simulatePause(2000);
    commitBackupStatus('local-backup-success', null);
  } catch (error) {
    globalManager.windowsEvents.enable();
    commitBackupStatus('local-backup-enable-events', null, { error });
  }
});

ipc.answerRenderer('get-default-backup-folder', () => getDefaultBackupFolder());

ipc.answerRenderer('restore-backup-unencrypted', async ({ backupPath }) => {
  try {
    globalManager.windowsEvents.disable();
    commitBackupStatus('restore-backup-disable-events');
    await prepareBackupFiles({ backupPrevFiles: false });
    await simulatePause(2000);
    globalManager.windowsEvents.enable();
    commitBackupStatus('restore-backup-enable-events');
    await restoreUnencryptedBackup({ filePath: backupPath });
    commitBackupStatus('restore-backup-finished');
    await simulatePause(2000);
    commitBackupStatus('restore-backup-success', null);
  } catch (error) {
    globalManager.windowsEvents.enable();
    commitBackupStatus('restore-backup-enable-events', null, {
      error: error.message
    });
  }
});

ipc.answerRenderer('restore-backup-encrypted', async params => {
  const { backupPath, password } = params;
  try {
    globalManager.windowsEvents.disable();
    commitBackupStatus('restore-backup-disable-events');
    await prepareBackupFiles({ backupPrevFiles: false });
    await simulatePause(2000);
    globalManager.windowsEvents.enable();
    commitBackupStatus('restore-backup-enable-events');
    await restoreEncryptedBackup({ filePath: backupPath, password });
    commitBackupStatus('restore-backup-finished');
    await simulatePause(2000);
    commitBackupStatus('restore-backup-success', null);
  } catch (error) {
    globalManager.windowsEvents.enable();
    commitBackupStatus('restore-backup-enable-events', null, {
      error: error.message
    });
  }
});

module.exports = {
  sendLinkDeviceStartEventToAllWindows,
  sendSyncMailboxStartEventToAllWindows
};
