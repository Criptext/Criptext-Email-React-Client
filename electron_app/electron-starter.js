const { app, ipcMain, Menu, BrowserWindow, Tray } = require('electron');
const dbManager = require('./src/DBManager');
const myAccount = require('./src/Account');
const wsClient = require('./src/socketClient');
const globalManager = require('./src/globalManager');
const mySettings = require('./src/Settings');
const loginWindow = require('./src/windows/login');
const mailboxWindow = require('./src/windows/mailbox');
const loadingWindow = require('./src/windows/loading');
const composerWindowManager = require('./src/windows/composer');
const {
  template,
  showWindows,
  trayIconTemplate,
  trayIcon
} = require('./src/windows/menu');
require('./src/ipc/composer.js');
require('./src/ipc/dialog.js');
require('./src/ipc/loading.js');
require('./src/ipc/login.js');
require('./src/ipc/mailbox.js');
require('./src/ipc/utils.js');

globalManager.forcequit.set(false);
let tray = null;

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
      setTrayIcon();
    } else {
      loginWindow.show();
    }
  } else {
    loginWindow.show();
  }

  ipcMain.on('response-dialog', (event, response, sendTo) => {
    if (sendTo === 'mailbox') {
      return mailboxWindow.responseFromDialogWindow(response);
    }
    return loginWindow.responseFromDialogWindow(response);
  });

  //   Composer
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

const saveScreenSize = () => {
  const screenSize = require('electron').screen.getPrimaryDisplay()
    .workAreaSize;
  globalManager.screenSize.save(screenSize);
};

//   App
app.disableHardwareAcceleration();

const isWindows = process.platform === 'win32';
const isLinux = process.platform === 'linux';
const isDev = process.env.NODE_ENV === 'development';

const setTrayIcon = () => {
  const isWindowsInstaller = isWindows && !globalManager.isWindowsStore.get();
  if (isWindowsInstaller && !tray) {
    tray = new Tray(trayIcon);
    const contextMenu = Menu.buildFromTemplate(trayIconTemplate);
    tray.setToolTip('Criptext');
    tray.setContextMenu(contextMenu);
    tray.on('click', initApp);
  }
};

const destroyTrayIcon = () => {
  if (isWindows && tray) {
    tray.destroy();
    tray = null;
  }
};

if ((isWindows || isLinux) && !isDev) {
  const shouldQuitInstance = app.makeSingleInstance((cmdL, wdir) => {
    initApp();
  });
  if (shouldQuitInstance) {
    app.quit();
    return;
  }
}

app.on('ready', () => {
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  initApp();
  saveScreenSize();
});

app.on('window-all-closed', () => {
  destroyTrayIcon();
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
