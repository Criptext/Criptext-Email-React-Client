const { app, ipcMain, dialog, Menu } = require('electron');
const dbManager = require('./src/DBManager');
const myAccount = require('./src/Account');
const wsClient = require('./src/socketClient');
const globalManager = require('./src/globalManager');

const loginWindow = require('./src/windows/login');
const dialogWindow = require('./src/windows/dialog');
const mailboxWindow = require('./src/windows/mailbox');
const loadingWindow = require('./src/windows/loading');
const composerWindowManager = require('./src/windows/composer');
const { template } = require('./src/windows/menu');

async function initApp() {
  try {
    await dbManager.createTables();
  } catch (ex) {
    console.log(ex);
  }

  const [existingAccount] = await dbManager.getAccount()
  if (existingAccount) {
    myAccount.initialize(existingAccount)
    wsClient.start(myAccount)
    mailboxWindow.show();
  } else {
    loginWindow.show();
  }
  
  // Errors
  ipcMain.on('throwError', (event, errorToShow) => {
    dialog.showErrorBox(errorToShow.name, errorToShow.description);
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
  ipcMain.on('open-mailbox', () => {
    wsClient.start(myAccount)
    mailboxWindow.show();
  });

  ipcMain.on('logout-app', () => {
    app.relaunch();
    app.exit(0);
  });

  //   Composer
  ipcMain.on('create-composer', () => {
    composerWindowManager.openNewComposer();
  });

  ipcMain.on('close-composer', (e, { composerId, emailId }) => {
    composerWindowManager.destroy({ composerId, emailId });
  });

  ipcMain.on('save-draft-changes', (e, windowParams) => {
    const { composerId, data } = windowParams;
    composerWindowManager.saveDraftChanges(composerId, data);
  });

  ipcMain.on('edit-draft', async (e, toEdit) => {
    await composerWindowManager.editDraft(toEdit);
  });

  ipcMain.on('failed-to-send', () => {
    composerWindowManager.sendEventToMailbox('failed-to-send', undefined);
  });

  // Socket
  wsClient.setMessageListener( data => {
    mailboxWindow.send('socket-message', data)
  })
}

//   App
app.disableHardwareAcceleration();

app.on('ready', () => {
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  initApp();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on("activate", () => {
  mailboxWindow.show();
})

app.on('before-quit', function() {
  globalManager.forcequit.set(true);
});