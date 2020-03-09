const { ipcMain: ipc } = require('@criptext/electron-better-ipc');
const { app, dialog } = require('electron');
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
const dbManager = require('./../database/DBEmanager');
const socketClient = require('./../socketClient');
const { upApp } = require('./../windows');
const myAccount = require('../Account');

ipc.answerRenderer('get-system-language', () => getSystemLanguage());

ipc.answerRenderer('get-computer-name', () => getComputerName());

ipc.answerRenderer('get-isWindows', () => isWindows());

ipc.answerRenderer('get-os-and-arch', () => getOsAndArch());

ipc.answerRenderer('process-pending-events', params => {
  const data = params.accountId
    ? params
    : { ...params, accountId: myAccount.id };
  processEventsQueue(data);
});

ipc.answerRenderer('restart-app', () => {
  app.relaunch();
  app.exit(0);
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
  loadingWindow.show({});
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
  loadingWindow.show({});
  return await clientManager.acknowledgeEvents([data.rowid]);
};

// Start Up
ipc.answerRenderer('app-up', ({ shouldSave, pin }) => {
  upApp({ shouldSave, pin });
});

ipc.answerRenderer('change-account-app', async accountId => {
  // Database
  await dbManager.defineActiveAccountById(accountId);
  // Socket
  socketClient.restartSocket();
  // Client
  const accounts = await dbManager.getAccountByParams({ isLoggedIn: true });
  const [activeAccount] = accounts.filter(account => account.isActive);
  const clientManager = require('./../clientManager');
  await clientManager.initClient(activeAccount.recipientId);
  //Account
  myAccount.initialize(accounts);
});

module.exports = {
  sendLinkDeviceStartEventToAllWindows,
  sendSyncMailboxStartEventToAllWindows
};
