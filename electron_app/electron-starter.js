const { app, ipcMain } = require('electron');
const dbManager = require('./src/DBManager');
const myAccount = require('./src/Account');
const wsClient = require('./src/socketClient');
const globalManager = require('./src/globalManager');
const mySettings = require('./src/Settings');
const loginWindow = require('./src/windows/login');
const mailboxWindow = require('./src/windows/mailbox');
const loadingWindow = require('./src/windows/loading');
const composerWindowManager = require('./src/windows/composer');
const { createAppMenu } = require('./src/windows/menu');
const {
  showWindows, 
  isDev, 
  isLinux, 
  isWindows,
  isFromStore,
  getSystemLanguage
} = require('./src/windows/windowUtils');
require('./src/ipc/composer.js');
require('./src/ipc/loading.js');
require('./src/ipc/login.js');
require('./src/ipc/mailbox.js');
require('./src/ipc/database.js');
require('./src/ipc/manager.js');
require('./src/ipc/dataTransfer.js');
const ipcUtils = require('./src/ipc/utils.js');

globalManager.forcequit.set(false);

async function initApp() {
  try {
    await dbManager.createTables();
    require('./src/ipc/client.js');
  } catch (ex) {
    console.log(ex);
  }

  const [activeAccount] = await dbManager.getAccount();
  if (activeAccount) {
    const appSettings = await dbManager.getSettings();
    const settings = Object.assign(appSettings, { isFromStore });
    myAccount.initialize(activeAccount);
    mySettings.initialize(settings);
    wsClient.start(myAccount);
    createAppMenu();
    mailboxWindow.show();
  } else {
    await getUserLanguage();
    createAppMenu();
    loginWindow.show({});
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
  const osLanguage = await getSystemLanguage();
  await dbManager.updateSettings({ language: osLanguage });
};

app.on('ready', () => {
  initApp();
});

app.on('activate', () => {
  showWindows();
});

app.on('before-quit', () => {
  globalManager.forcequit.set(true);
});
