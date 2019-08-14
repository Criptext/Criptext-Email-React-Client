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
const { spawn } = require('child_process')
const path = require('path');
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
require('./src/ipc/backup.js');
const ipcUtils = require('./src/ipc/utils.js');

globalManager.forcequit.set(false);

const getAlicePath = nodeEnv => {
  switch (nodeEnv) {
    case 'development': {
      return path.join(__dirname, '../signal_interface/build/Release/alice')
    }
    default: {
      return path.join(path.dirname(__dirname), 'extraResources','alice');
    }
  }
}

let alice = null;
let aliceStartTimeout = null;
const startAlice = () => {
  aliceStartTimeout = null;
  if (!alice) {
    const alicePath = getAlicePath(process.env.NODE_ENV);
    const dbpath = path.resolve(dbManager.databasePath);
    alice = spawn(alicePath, [dbpath]);
    alice.stdout.on('data', (data) => {
      console.log(`-----alice-----\n${data}\n -----end-----`);
    });
    alice.on('exit', (code, signal) => {
      console.log('alice exited with ' + `code ${code} and signal ${signal}`);
      alice = null;
      if (signal !== 'SIGTERM') {
        return;
      }
      aliceStartTimeout = setTimeout( () => {
        startAlice();
      }, 500)
    });
  }
}

async function initApp() {
  try {
    await dbManager.createTables();
    require('./src/ipc/client.js');
  } catch (ex) {
    console.log(ex);
  }

  //startAlice();

  const [existingAccount] = await dbManager.getAccount();
  if (existingAccount) {
    const needsMigration = !(await dbManager.hasColumnPreKeyRecordLength());
    if (needsMigration) {
      globalManager.windowsEvents.disable()
      globalManager.needsUpgrade.enable()
    } else {
      globalManager.windowsEvents.enable()
      globalManager.needsUpgrade.disable()
    }

    if (!!existingAccount.deviceId) {
      const appSettings = await dbManager.getSettings();
      const settings = Object.assign(appSettings, { isFromStore });
      myAccount.initialize(existingAccount);
      mySettings.initialize(settings);
      wsClient.start(myAccount);
      createAppMenu();
      mailboxWindow.show({ firstOpenApp: true });
    } else {
      await getUserLanguage();
      createAppMenu();
      loginWindow.show();
    }
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
  if (alice) {
    alice.kill();
  } else if (aliceStartTimeout) {
    clearTimeout(aliceStartTimeout);
    aliceStartTimeout = null;
  }
  globalManager.forcequit.set(true);
});
