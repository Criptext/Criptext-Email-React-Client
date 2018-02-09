const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const dbManager = require('./src/DBManager');

let mainWindow;
let composerWindow;
let loginWindow;
let modalWindow;
let loadingWindow;

const loginSize = {
  width: 328,
  height: 513
}

const signUpSize = {
  width: 328,
  height: 513
}

const loadingSize = {
  width: 327,
  height: 141
}

async function createLoginWindow() {
  try {
    await dbManager.createTables();
  } catch (ex) {
    console.log(ex);
  }
  
  const loginUrl = 
    'http://localhost:3002' ||
    url.format({
      pathname: path.join(__dirname, '../../email_login/build/index.html'),
      protocol: 'file:',
      slashes: true
    });

  const modalUrl =
    'http://localhost:3001' || 
    url.format({
      pathname: path.join(__dirname, '../../email_dialog/build/index.html'),
      protocol: 'file:',
      slashes: true
    });

  const mailboxUrl =
    process.env.ELECTRON_START_URL ||
    'http://localhost:3000' ||
    url.format({
      pathname: path.join(__dirname, './src/app/email_mailbox/index.html'),
      protocol: 'file:',
      slashes: true
    });

  const loadingUrl =
    'http://localhost:3003' ||
    url.format({
      pathname: path.join(__dirname, './src/app/email_loading/index.html'),
      protocol: 'file:',
      slashes: true
    });

  const composerUrl =
    'http://localhost:3004' ||
    url.format({
      pathname: path.join(__dirname, './src/app/email_composer/index.html'),
      protocol: 'file:',
      slashes: true
    });

  loginWindow = new BrowserWindow({ 
    width: loginSize.width, 
    height: loginSize.height, 
    show: false,
    center: true
  });    
  loginWindow.loadURL(loginUrl);
  loginWindow.setMenu(null);
  loginWindow.setResizable(false);

  loginWindow.once('ready-to-show', () => {
    loginWindow.show();
  });

  ipcMain.on('close-login', () => {
    if ( loginWindow !== null ) {
      loginWindow.close();  
    }
    loginWindow = null;
  });

  loginWindow.on('closed', () => {
    loginWindow = null;
  });
  

  ipcMain.on('resizeSignUp', () => {
    loginWindow.setSize(loginSize.width, loginSize.height);
  });

  ipcMain.on('resizeLogin', () => {
    loginWindow.setSize(signUpSize.width, signUpSize.height);
  });


  ipcMain.on('open-modal', (event, arg) => {
    modalWindow = new BrowserWindow({
      parent: loginWindow,
      width: 393, 
      height: 267,
      frame: false,
      transparent: true,
      show: false,
      alwaysOnTop: true
    });
    modalWindow.loadURL(modalUrl);
    modalWindow.setMenu(null);
    modalWindow.setResizable(false);

    modalWindow.once('ready-to-show', () => {
      modalWindow.show();
    });
  });

  
  ipcMain.on('response-modal', (event, response) => {
    loginWindow.webContents.send('selectedOption' , {
      selectedOption: response
    });
  });

  ipcMain.on('close-modal', () => {
    if ( modalWindow !== null ) {
      modalWindow.close();  
    }
    modalWindow = null;
  });


  ipcMain.on('open-loading', (event, arg) => {
    loadingWindow = new BrowserWindow({
      width: loadingSize.width, 
      height: loadingSize.height,
      frame: false,
      transparent: true,
      show: false
    });
    loadingWindow.loadURL(loadingUrl);
    loadingWindow.setMenu(null);
    loadingWindow.setResizable(false);

    loadingWindow.once('ready-to-show', () => {
      loadingWindow.show();
    });
  });

  ipcMain.on('close-loading', () => {
    if ( loadingWindow !== null ) {
      loadingWindow.close();  
    }
    
    loadingWindow = null;
  });


  ipcMain.on('open-mailbox', () => {
    mailboxWindow = new BrowserWindow({ 
      width: 800, 
      height: 600,
      show: false
    });
    mailboxWindow.loadURL(mailboxUrl);
    mailboxWindow.once('ready-to-show', () => {
      mailboxWindow.show();
      mailboxWindow.maximize();
    });

    mailboxWindow.on('closed', () => {
      mainWindow = null;
    });
  });


  ipcMain.on('create-composer', () => {
    composerWindow = new BrowserWindow({ 
      width: 360, 
      height: 280 
    });
    composerWindow.loadURL(composerUrl);

    composerWindow.on('closed', () => {
      composerWindow = null;
    });
  });

  ipcMain.on('close-composer', () => {
    composerWindow.close();
    composerWindow = null;
  });

}


app.on('ready', createLoginWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createLoginWindow();
  }
});

