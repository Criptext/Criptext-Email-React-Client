const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const dbManager = require('./DBManager');

let mainWindow;
let composerWindow;

async function createWindow() {
  try {
    await dbManager.createTables();
  } catch (ex) {
    console.log(ex);
  }
  mainWindow = new BrowserWindow({ width: 800, height: 600 });

  const startUrl =
    process.env.ELECTRON_START_URL ||
    url.format({
      pathname: path.join(__dirname, '../../email_mailbox/build/index.html'),
      protocol: 'file:',
      slashes: true
    });
  mainWindow.loadURL(startUrl);

  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  ipcMain.on('create-composer', () => {
    composerWindow = new BrowserWindow({ width: 360, height: 280 });
    composerWindow.webContents.openDevTools();
    composerWindow.loadURL(startUrl);

    composerWindow.on('closed', () => {
      composerWindow = null;
    });
  });

  ipcMain.on('close-composer', () => {
    composerWindow.close();
    composerWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
