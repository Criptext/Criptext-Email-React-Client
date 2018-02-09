const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const dbManager = require('./src/DBManager');
const { 
  loginUrl, 
  modalUrl,
  mailboxUrl,
  loadingUrl, 
  composerUrl
} = require('./src/window_routing');


let loginWindow;
let modalWindow;
let loadingWindow;
let mailboxWindow;
let composerWindow;

const loginSize = {
  width: 328,
  height: 513
}

const signUpSize = {
  width: 328,
  height: 513
}

const modalSize = {
  width: 393,
  height: 267
}

const loadingSize = {
  width: 327,
  height: 141
}

const mailboxSize = {
  width: 1094,
  height: 604
}

const composerSize = {
  width: 702,
  height: 556
}

async function createLoginWindow() {
  try {
    await dbManager.createTables();
  } catch (ex) {
    console.log(ex);
  }

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
      width: mailboxSize.width, 
      height: mailboxSize.height,
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
      width: composerSize.width, 
      height: composerSize.height
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

