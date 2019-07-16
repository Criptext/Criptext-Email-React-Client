const ipc = require('@criptext/electron-better-ipc');
const { app, dialog, BrowserWindow } = require('electron');
const {
  getComputerName,
  isWindows,
  getOsAndArch
} = require('../utils/osUtils');
const { processEventsQueue } = require('../eventQueueManager');
const globalManager = require('./../globalManager');
const loadingWindow = require('./../windows/loading');
const { getSystemLanguage } = require('./../windows/windowUtils');
const {
  createDefaultBackupFolder,
  exportBackupFile,
  getDefaultBackupFolder
} = require('./../BackupManager');

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

const sendEventToAllWindows = eventName => {
  const openedWindows = BrowserWindow.getAllWindows();
  return openedWindows.forEach(openWindow => {
    openWindow.webContents.send(eventName);
  });
};

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
ipc.answerRenderer('create-default-backup-folder', () =>
  createDefaultBackupFolder()
);

ipc.answerRenderer('export-backup-file', ({ customPath, password }) =>
  exportBackupFile({ customPath, password })
);

ipc.answerRenderer('get-default-backup-folder', () => getDefaultBackupFolder());

module.exports = {
  sendLinkDeviceStartEventToAllWindows,
  sendSyncMailboxStartEventToAllWindows
};
