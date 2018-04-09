const { app, ipcMain, dialog } = require('electron');
const dbManager = require('./src/DBManager');
const myAccount = require('./src/Account');
const wsClient = require('./src/socketClient')
const errors = require('./src/errors');

const loginWindow = require('./src/windows/login');
const dialogWindow = require('./src/windows/dialog');
const mailboxWindow = require('./src/windows/mailbox');
const loadingWindow = require('./src/windows/loading');
const composerWindow = require('./src/windows/composer');
global.modalData = {}
global.loadingData = {}

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

  ipcMain.on('minimize-login', () => {
    loginWindow.minimize();
  });

  //   Dialog
  ipcMain.on('open-modal', (event, modalData) => {
    global.modalData = modalData;
    dialogWindow.show();
  });

  ipcMain.on('response-modal', (event, response) => {
    loginWindow.responseFromModal(response);
  });

  ipcMain.on('close-modal', () => {
    dialogWindow.close();
  });

  //   Loading
  ipcMain.on('open-create-keys', (event, arg) => {
    global.loadingData = arg;
    loadingWindow.show();
  });

  ipcMain.on('close-create-keys', () => {
    loadingWindow.close();
    global.loadingData = {};
  });

  //   Mailbox
  ipcMain.on('open-mailbox', () => {
    wsClient.start(myAccount)
    mailboxWindow.show();
  });

  //   Composer
  ipcMain.on('create-composer', () => {
    composerWindow.show();
  });

  ipcMain.on('close-composer', () => {
    composerWindow.close();
  });

  ipcMain.on('save-draft-changes', (e, data) => {
    composerWindow.saveDraftChanges(data);
  });

  wsClient.setMessageListener( data => {
    mailboxWindow.send('socket-message', data)
    composerWindow.send('socket-message', data)
  })
}

//   App
app.disableHardwareAcceleration();

app.on('ready', initApp);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (loginWindow === undefined) {
    initApp();
  }
});
