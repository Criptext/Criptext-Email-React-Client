const {
  app,
  BrowserWindow,
  ipcMain
} = require('electron');
const dbManager = require('./src/DBManager');
const {
  loginUrl,
  modalUrl,
  mailboxUrl,
  loadingUrl,
  composerUrl
} = require('./src/window_routing');

let mainWindow;
let loginWindow;
let dialogWindow;
let loadingWindow;
let mailboxWindow;
let composerWindow;
global.modalData = {}
global.loadingData = {}

const loginSize = {
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


/*  Login window 
----------------------------- */
const createLoginWindow = () => {
  loginWindow = new BrowserWindow({
    width: loginSize.width,
    height: loginSize.height,
    center: true,
    frame: false,
    show: false,
    transparent: true,
    webPreferences: {
      webSecurity: false
    }
  });
  loginWindow.loadURL(loginUrl);
  loginWindow.setMenu(null);
  loginWindow.setResizable(false);
  loginWindow.on('closed', () => {
    loginWindow = undefined;
  });
}

const showLoginWindow = async () => {
  if (loginWindow === undefined) {
    await createLoginWindow();
  }
  loginWindow.once('ready-to-show', () => {
    loginWindow.show();
  });
}

/*  Modal
----------------------------- */
const createDialogWindow = () => {
  dialogWindow = new BrowserWindow({
    parent: loginWindow,
    width: modalSize.width,
    height: modalSize.height,
    show: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true
  });
  dialogWindow.loadURL(modalUrl);
  dialogWindow.setMenu(null);
  dialogWindow.setResizable(false);
}

const showDialogWindow = () => {
  if (dialogWindow === undefined) {
    createDialogWindow();
  }
  dialogWindow.once('ready-to-show', () => {
    dialogWindow.show();
  });
}

/*  Loading Window
----------------------------- */
const createLoadingWindow = () => {
  loadingWindow = new BrowserWindow({
    width: loadingSize.width,
    height: loadingSize.height,
    show: false,
    frame: false,
    transparent: true,
    webPreferences: {
      webSecurity: false
    }
  });
  loadingWindow.loadURL(loadingUrl);
  loadingWindow.setMenu(null);
  loadingWindow.setResizable(false);
}

const showLoadingWindow = () => {
  if (loadingWindow === undefined) {
    createLoadingWindow();
  }
  loadingWindow.once('ready-to-show', () => {
    loadingWindow.show();
  });
}

/*  Mailbox Window
----------------------------- */
const createMailboxWindow = () => {
  mailboxWindow = new BrowserWindow({
    width: mailboxSize.width,
    height: mailboxSize.height,
    show: false,
    title: ""
  });
  mailboxWindow.loadURL(mailboxUrl);
  mailboxWindow.setMenu(null);
  mailboxWindow.on('page-title-updated', (event) => {
    event.preventDefault();
  });
  mailboxWindow.on('closed', () => {
    mainWindow = undefined;
  });
}

const showMailboxWindow = () => {
  if (mailboxWindow === undefined) {
    createMailboxWindow();
  }
  mailboxWindow.once('ready-to-show', () => {
    mailboxWindow.show();
    mailboxWindow.maximize();
  });
}

/*  Composer Window
----------------------------- */
const createComposerWindow = () => {
  composerWindow = new BrowserWindow({
    width: composerSize.width,
    height: composerSize.height,
    show: false,
    title: "New Secure Message",
    webPreferences: {
      webSecurity: false
    }
  });
  composerWindow.loadURL(composerUrl);
  composerWindow.setMenu(null);
  composerWindow.on('page-title-updated', (event) => {
    event.preventDefault();
  });
  composerWindow.on('closed', () => {
    composerWindow = undefined;
  });
}

const showComposerWindow = () => {
  if (composerWindow === undefined) {
    createComposerWindow();
  }
  composerWindow.once('ready-to-show', () => {
    composerWindow.show();
  });
}


async function initApp() {
  try {
    await dbManager.createTables();
  } catch (ex) {
    console.log(ex);
  }

  /*==========================
   *    Check account
   *=========================*/
  const existingAccount = await dbManager.getAccount();
  if (existingAccount.length > 0) {
    showMailboxWindow();
  } else {
    showLoginWindow();
  }

  /*==========================
   *    Renderer events
   *=========================*/

  /*  Login
  ------------------------ */
  ipcMain.on('close-login', () => {
    if (loginWindow !== null) {
      loginWindow.close();
    }
    loginWindow = undefined;
  });

  ipcMain.on('minimize-login', () => {
    if (loginWindow !== null) {
      loginWindow.minimize();
    }
  });

  /*  Dialog
  ------------------------ */
  ipcMain.on('open-modal', (event, modalData) => {
    global.modalData = modalData;
    showDialogWindow();
  });

  ipcMain.on('response-modal', (event, response) => {
    loginWindow.webContents.send('selectedOption', {
      selectedOption: response
    });
  });

  ipcMain.on('close-modal', () => {
    if (dialogWindow !== null) {
      dialogWindow.close();
    }
    global.modalData = {};
    dialogWindow = undefined;
  });

  /*  Loading
  ------------------------ */
  ipcMain.on('open-create-keys', (event, arg) => {
    global.loadingData = arg;
    showLoadingWindow();
  });

  ipcMain.on('close-create-keys', () => {
    if (loadingWindow !== null) {
      loadingWindow.close();
    }
    global.loadingData = {};
    loadingWindow = undefined;
  });

  /*  Mailbox
   ------------------------ */
  ipcMain.on('open-mailbox', () => {
    showMailboxWindow();
  });

  /*  Composer
   ----------------------------- */
  ipcMain.on('create-composer', () => {
    showComposerWindow();
  });

  ipcMain.on('close-composer', () => {
    composerWindow.close();
    composerWindow = undefined;
  });
}


/*  App
----------------------------- */
app.disableHardwareAcceleration();

app.on('ready', initApp);

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