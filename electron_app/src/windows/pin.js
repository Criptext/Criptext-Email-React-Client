const { BrowserWindow } = require('electron');
const path = require('path');
const { pinUrl } = require('../window_routing');
const loginWindow = require('./login');
const { EVENTS, callEvent } = require('./events');
const { isDev } = require('./windowUtils');
const { isWindows } = require('./../utils/osUtils');
const {
  initDatabaseEncrypted,
  resetKeyDatabase
} = require('../database/DBEmanager');
const keytar = require('keytar');
const globalManager = require('./../globalManager');
const { encryptDataBase } = require('./../utils/dataBaseUtils');
let pinWindow;
let shouldCloseForce = false;

const pinSize = {
  width: 328,
  height: 564
};

const iconPath = path.join(
  __dirname,
  './../../resources/launch-icons/icon.png'
);

const create = () => {
  pinWindow = new BrowserWindow({
    parent: loginWindow.loginWindow,
    width: pinSize.width,
    height: pinSize.height,
    icon: iconPath,
    show: false,
    frame: !isWindows(),
    webPreferences: { webSecurity: !isDev, nodeIntegration: true }
  });
  pinWindow.loadURL(pinUrl);
  pinWindow.setMenu(null);
  pinWindow.setResizable(false);
  if (isWindows()) pinWindow.setMenuBarVisibility(false);
  if (process.env.NODE_ENV === 'development') {
    pinWindow.setResizable(true);
    pinWindow.webContents.openDevTools({ mode: 'undocked' });
  }

  pinWindow.on('close', e => {
    const isMacOs = process.platform === 'darwin';
    if (shouldCloseForce === true) {
      shouldCloseForce = false;
      return;
    }
    if (isMacOs && !globalManager.forcequit.get()) {
      e.preventDefault();
      hide();
    }
  });

  pinWindow.on('closed', () => {
    if (process.platform !== 'darwin') {
      pinWindow = undefined;
    }
  });
};

const close = ({ forceClose }) => {
  shouldCloseForce = forceClose;
  if (pinWindow !== undefined) {
    pinWindow.close();
  }
  pinWindow = undefined;
};

const hide = () => {
  if (pinWindow && pinWindow.hide) {
    pinWindow.hide();
  }
};

const minimize = () => {
  if (pinWindow !== undefined) {
    pinWindow.minimize();
  }
};

const show = async () => {
  if (pinWindow === undefined) {
    await create();
  }
  pinWindow.once('ready-to-show', () => {
    pinWindow.show();
  });
};

const toggleMaximize = () => {
  if (pinWindow !== undefined) {
    if (pinWindow.isMaximized()) {
      pinWindow.unmaximize();
    } else {
      pinWindow.maximize();
    }
  }
};

const setUpPin = async ({ pin, shouldSave, shouldExport, shouldResetPin }) => {
  if (shouldSave) {
    keytar
      .setPassword('CriptextMailDesktopApp', 'unique', `${pin}`)
      .then(result => {
        console.log('result', result);
      })
      .catch(error => {
        console.log('error', error);
      });
  }
  globalManager.databaseKey.set(pin);

  if (shouldResetPin) {
    await resetKeyDatabase(pin);
  } else {
    await initDatabaseEncrypted({ key: pin });
  }

  if (shouldExport) await encryptDataBase();
  callEvent(EVENTS.Up_app, {});
};

const checkPin = async () => {
  return await keytar.getPassword('CriptextMailDesktopApp', 'unique');
};

const validatePin = async pinToValidate => {
  const credentials = await checkPin();
  if (credentials) {
    return pinToValidate === credentials.password;
  }

  try {
    await initDatabaseEncrypted({ key: pinToValidate, shouldReset: true });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports = {
  checkPin,
  close,
  minimize,
  setUpPin,
  show,
  toggleMaximize,
  validatePin
};
