const { BrowserWindow } = require('electron');
const path = require('path');
const { pinUrl } = require('../window_routing');
const loginWindow = require('./login');
const { isDev } = require('./windowUtils');
const { isWindows } = require('./../utils/osUtils');
const { initDatabaseEncrypted } = require('../database/DBEmanager');
const keytar = require('keytar');
const globalManager = require('./../globalManager');
const { encryptDataBase } = require('./../utils/dataBaseUtils');
let pinWindow;

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
};

const close = () => {
  if (pinWindow !== undefined) {
    pinWindow.close();
  }
  pinWindow = undefined;
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

const validatePin = async ({ pin, shouldSave }) => {
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
  await initDatabaseEncrypted(pin);
  await encryptDataBase();
};

module.exports = {
  close,
  minimize,
  show,
  toggleMaximize,
  validatePin
};
