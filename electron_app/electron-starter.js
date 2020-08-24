const { app, dialog, ipcMain, shell } = require('electron');
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
require('./src/ipc/logger');
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
const logger = require('./src/logger');

globalManager.forcequit.set(false);

const oldVersionUrl = () => {
  if (isLinux) {
    return 'https://cdn.criptext.com/Criptext-Email-Desktop/linux/old_versions/0.27.5/Criptext-0.27.5.AppImage'
  } else if (isWindows) {
    return 'https://cdn.criptext.com/Criptext-Email-Desktop/windows/old_versions/0.27.5/Criptext-0.27.5.exe'
  } else {
    return 'https://cdn.criptext.com/Criptext-Email-Desktop/mac/old_version/0.27.5/Criptext-0.27.5.dmg'
  }
}

process.on('uncaughtException', async err => {
  logger.error('Uncaught Error: ', err);
  await dialog.showMessageBox(null, {
    type: "Application Error",
    buttons: ["Ok"],
    title: 'An unexpected error occurred',
    message: `Error: ${err.toString()}`,
  })
  closeAlice();
  app.exit(0);
})

process.on('unhandledRejection', err => {
  logger.error('Unhandled Rejection: ', err);
})

async function initApp() {
  const step = await checkDatabaseStep(dbManager);
  switch (step) {
    case 1:{
      const { response } = await dialog.showMessageBox(null, {
        type: "warning",
        buttons: ["Exit", "Download"],
        title: 'Your database is outdated',
        message: 'Your database is outdated. Download and install the following version of the app in order to migrate your data.',
      })
      if (response === 1) {
        shell.openExternalSync(oldVersionUrl());
      }
      app.exit(0);
    }
    break;
    case 2:{
      try {
        await upStepCreateDBEncrypted();
      } catch (ex) {
        await deleteNotEncryptDatabase();
        closeAlice();
        app.relaunch();
        app.exit(0);
        logger.error(ex)
      }
      break;
    }
    case 3:{
      try {
        await upStepNewUser();
      } catch (ex) {
        logger.error(ex)
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

  ipcMain.on('send-recovery-email', () => {
    composerWindowManager.sendEventToMailbox('send-recovery-email', undefined)
  })

  ipcMain.on('open-recovery-email-mailbox', (ev,params) => {
    composerWindowManager.sendEventToMailbox('open-recovery-email-mailbox', params)
  })

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
