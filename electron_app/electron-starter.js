const { app, BrowserWindow, ipcMain } = require('electron');
const dbManager = require('./src/DBManager');
const myAccount = require('./src/Account');

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

  const existingAccount = (await dbManager.getAccount())[0]
  if (existingAccount) {
    myAccount.initialize(existingAccount)
    mailboxWindow.show();
  } else {
    loginWindow.show();
  }

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
    mailboxWindow.show();
  });

  //   Composer
  ipcMain.on('create-composer', () => {
    composerWindow.show();
  });

  ipcMain.on('close-composer', () => {
    composerWindow.close();
  });
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