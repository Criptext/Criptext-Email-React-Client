const { app, ipcMain, dialog, Menu, BrowserWindow } = require('electron');
const dbManager = require('./src/DBManager');
const myAccount = require('./src/Account');
const wsClient = require('./src/socketClient');
const globalManager = require('./src/globalManager');
const mySettings = require('./src/Settings');

const loginWindow = require('./src/windows/login');
const dialogWindow = require('./src/windows/dialog');
const mailboxWindow = require('./src/windows/mailbox');
const loadingWindow = require('./src/windows/loading');
const composerWindowManager = require('./src/windows/composer');
const { template, showWindows } = require('./src/windows/menu');
const { processEventsQueue } = require('./src/eventQueueManager');
const { showNotification } = require('./src/updater');
require('./src/ipc/utils.js')
require('./src/ipc/mailbox.js')

globalManager.forcequit.set(false);

async function initApp() {
  try {
    await dbManager.createTables();
  } catch (ex) {
    console.log(ex);
  }

  const [existingAccount] = await dbManager.getAccount();
  if (existingAccount) {
    if (!!existingAccount.deviceId) {
      const appSettings = await dbManager.getAppSettings();
      myAccount.initialize(existingAccount);
      mySettings.initialize(appSettings);
      wsClient.start(myAccount);
      mailboxWindow.show();
    } else {
      loginWindow.show();
    }
  } else {
    loginWindow.show();
  }

  // Errors
  ipcMain.on('throwError', (ev, { name, description }) => {
    dialog.showErrorBox(name, description);
  });

  //   Login
  ipcMain.on('close-login', () => {
    loginWindow.close();
  });

  ipcMain.on('hide-login', () => {
    loginWindow.hide();
  });

  ipcMain.on('minimize-login', () => {
    loginWindow.minimize();
  });

  //   Dialog
  ipcMain.on('open-modal', (event, modalData) => {
    globalManager.modalData.set(modalData);
    dialogWindow.show();
  });

  ipcMain.on('response-modal', (event, response, sendTo) => {
    if (sendTo === 'mailbox') {
      return mailboxWindow.responseFromModal(response);
    }
    return loginWindow.responseFromModal(response);
  });

  ipcMain.on('close-modal', () => {
    dialogWindow.close();
  });

  //   Loading
  ipcMain.on('open-create-keys', (event, arg) => {
    globalManager.loadingData.set(arg);
    loadingWindow.show();
  });

  ipcMain.on('close-create-keys', () => {
    loadingWindow.close();
    globalManager.loadingData.set({});
  });

  //   Mailbox
  ipcMain.on('download-update', () => {
    mailboxWindow.downloadUpdate();
  });

  ipcMain.on('logout-app', () => {
    app.relaunch();
    app.exit(0);
  });

  ipcMain.on('open-mailbox', () => {
    wsClient.start(myAccount);
    mailboxWindow.show();
  });

  ipcMain.on('update-dock-badge', (event, value) => {
    const currentBadge = app.getBadgeCount();
    if(currentBadge !== value){
      app.setBadgeCount(value);
    }
  });

  ipcMain.on('process-pending-events', () => {
    processEventsQueue();
  });

  ipcMain.on('show-notification', (ev, { title, message }) => {
    showNotification({ title, message });
  });

  ipcMain.on('minimize-mailbox', () => {
    mailboxWindow.minimize();
  });

  ipcMain.on('toggle-maximize-mailbox', () => {
    mailboxWindow.toggleMaximize();
  });

  ipcMain.on('close-mailbox', () => {
    mailboxWindow.close();
  });

  //   Composer
  ipcMain.on('close-composer', (e, { composerId, emailId, threadId, hasExternalPassphrase }) => {
    composerWindowManager.destroy({ composerId, emailId, threadId, hasExternalPassphrase });
  });

  ipcMain.on('save-draft-changes', (e, windowParams) => {
    const { composerId, data } = windowParams;
    composerWindowManager.saveDraftChanges(composerId, data);
  });

  ipcMain.on('failed-to-send', () => {
    composerWindowManager.sendEventToMailbox('failed-to-send', undefined);
  });

  // Socket
  wsClient.setMessageListener(async data => {
    const SIGNIN_VERIFICATION_REQUEST_COMMAND = 201;
    if (data.cmd === SIGNIN_VERIFICATION_REQUEST_COMMAND) {
      await sendLinkDeviceStartEventToAllWindows(data);
    } else {
      mailboxWindow.send('socket-message', data);
      loginWindow.send('socket-message', data);
      loadingWindow.send('socket-message', data);
    }
  });

  // Link devices
  ipcMain.on('start-link-devices-event', async (ev, data) => {
    await sendLinkDeviceStartEventToAllWindows(data);
  });

  ipcMain.on('end-link-devices-event', async (ev, data) => {
    await sendLinkDeviceEndEventToAllWindows(data);
  });
}

const sendLinkDeviceStartEventToAllWindows = async data => {
  const clientManager = require('./src/clientManager');
  globalManager.windowsEvents.disable();
  sendEventToAllwWindows('disable-window-link-devices');
  globalManager.loadingData.set({
    loadingType: 'link-device-request',
    remoteData: data.params.newDeviceInfo
  });
  loadingWindow.show();
  return await clientManager.acknowledgeEvents([data.rowid]);
};

const sendLinkDeviceEndEventToAllWindows = () => {
  globalManager.windowsEvents.enable();
  sendEventToAllwWindows('enable-window-link-devices');
};

const sendEventToAllwWindows = eventName => {
  const openedWindows = BrowserWindow.getAllWindows();
  return openedWindows.forEach(openWindow => {
    openWindow.webContents.send(eventName);
  });
};

//   App
app.disableHardwareAcceleration();

app.on('ready', () => {
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  initApp();
  const screenSize = require('electron').screen.getPrimaryDisplay().workAreaSize;
  globalManager.screenSize.save(screenSize);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  showWindows();
});

app.on('before-quit', () => {
  globalManager.forcequit.set(true);
});