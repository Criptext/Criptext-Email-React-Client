const { app, ipcMain, Menu, Tray } = require('electron');
const osLocale = require('os-locale');
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
require('./src/ipc/loading.js');
require('./src/ipc/login.js');
require('./src/ipc/mailbox.js');
require('./src/ipc/database.js');
require('./src/ipc/client.js');
const ipcUtils = require('./src/ipc/utils.js');

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
      const appSettings = await dbManager.getSettings();
      myAccount.initialize(existingAccount);
      mySettings.initialize(appSettings);
      wsClient.start(myAccount);
      mailboxWindow.show();
      setTrayIcon();
    } else {
      await getUserLanguage();
      loginWindow.show();
    }
  } else {
    await getUserLanguage();
    loginWindow.show();
  }

  //   Composer
  ipcMain.on('failed-to-send', () => {
    composerWindowManager.sendEventToMailbox('failed-to-send', undefined);
  });

  // Socket
  wsClient.setMessageListener(async data => {
    const SIGNIN_VERIFICATION_REQUEST_COMMAND = 201;
    const MANUAL_SYNC_REQUEST_COMMAND = 211;
    // This validation is for closed-mailbox case
    if (data.cmd === SIGNIN_VERIFICATION_REQUEST_COMMAND) {
      await ipcUtils.sendLinkDeviceStartEventToAllWindows(data);
    }
    else if (data.cmd === MANUAL_SYNC_REQUEST_COMMAND) {
      await ipcUtils.sendSyncMailboxStartEventToAllWindows(data);
    } else {
      mailboxWindow.send('socket-message', data);
      loginWindow.send('socket-message', data);
      loadingWindow.send('socket-message', data);
    }
  });
}

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

const getUserLanguage = async () => {
  const localeLanguage = await osLocale();
  const isEnglish = localeLanguage.indexOf('en') > -1;
  const isSpanish = localeLanguage.indexOf('es') > -1;
  const osLanguage = isEnglish ? 'en' : isSpanish ? 'es' : 'en';
  await dbManager.updateSettings({ language: osLanguage });
};

app.on('ready', () => {
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  initApp();
});

app.on('window-all-closed', () => {
  destroyTrayIcon();
  require('./src/socketClient').disconnect();
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
