const { app, dialog, ipcMain } = require('electron');
const socketClient = require('./src/socketClient');
const globalManager = require('./src/globalManager');
const { dbManager, upStepCreateDBEncrypted, upStepCheckPIN, upStepNewUser } = require('./src/windows');
const loginWindow = require('./src/windows/login');
const mailboxWindow = require('./src/windows/mailbox');
const loadingWindow = require('./src/windows/loading');
const composerWindowManager = require('./src/windows/composer');
const myAccount = require('./src/Account');
const { closeAlice } = require('./src/aliceManager');
const {
  showWindows,
  isDev,
  isLinux,
  isWindows
} = require('./src/windows/windowUtils');
require('./src/ipc/composer.js');
require('./src/ipc/pin.js');
require('./src/ipc/loading.js');
require('./src/ipc/login.js');
require('./src/ipc/mailbox.js');
require('./src/ipc/database.js');
require('./src/ipc/manager.js');
require('./src/ipc/dataTransfer.js');
require('./src/ipc/backup.js');
require('./src/ipc/nucleus.js');
require('./src/ipc/client.js');
const ipcUtils = require('./src/ipc/utils.js');
const { checkDatabaseStep, deleteNotEncryptDatabase } = require('./src/utils/dataBaseUtils');
const { APP_DOMAIN } = require('./src/utils/const');

globalManager.forcequit.set(false);

async function initApp() {
  const step = await checkDatabaseStep(dbManager);
  switch (step) {
    case 1:{
      dialog.showErrorBox('Your version is outdated',' Please contact us: support@criptext.com to help you.');
    }
    break;
    case 2:{
      try {
        await upStepCreateDBEncrypted();
      } catch (ex) {
        await deleteNotEncryptDatabase();
        app.relaunch();
        app.exit(0);
        console.log(ex);
      }
      break;
    }
    case 3:{
      try {
        await upStepNewUser();
      } catch (ex) {
        console.log(ex);
      }
      break;
    }
    case 4:{
      await upStepCheckPIN();
      break; 
    }
    default:
      break;
  } 

  // Composer
  ipcMain.on('failed-to-send', () => {
    composerWindowManager.sendEventToMailbox('failed-to-send', undefined);
  });

  // Socket
  socketClient.setMessageListener(async data => {
    const { cmd, recipientId, domain } = data;
    const SIGNIN_VERIFICATION_REQUEST_COMMAND = 201;
    const MANUAL_SYNC_REQUEST_COMMAND = 211;
    const accountRecipientId =
      domain === APP_DOMAIN ? recipientId : `${recipientId}@${domain}`;
    const isToMe = accountRecipientId === myAccount.recipientId;
    // This validation is for closed-mailbox case
    if (isToMe && cmd === SIGNIN_VERIFICATION_REQUEST_COMMAND) {
      await ipcUtils.sendLinkDeviceStartEventToAllWindows(data);
    }
    else if (isToMe && cmd === MANUAL_SYNC_REQUEST_COMMAND) {
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
  const lock = app.requestSingleInstanceLock();
  if (!lock) {
    app.quit();
    return;
  } else {
    app.on('second-instance', (event, argv, cwd) => {
      initApp();
    })
  }
}

app.on('ready', () => {
  initApp();
});

app.on('activate', () => {
  showWindows();
});

app.on('before-quit', () => {
  closeAlice();
  globalManager.forcequit.set(true);
});
