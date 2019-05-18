const { BrowserWindow, shell } = require('electron');
const { loginUrl } = require('./../window_routing');
const globalManager = require('./../globalManager');
const path = require('path');
let loginWindow;
let loginShouldBeClose;

const loginSize = {
  width: 328,
  height: 543
};

const iconPath = path.join(
  __dirname,
  './../../resources/launch-icons/icon.png'
);

const create = ({ shouldBeClose }) => {
  loginWindow = new BrowserWindow({
    icon: iconPath,
    width: loginSize.width,
    height: loginSize.height,
    center: true,
    frame: false,
    show: false,
    transparent: true
  });
  loginShouldBeClose = shouldBeClose;
  loginWindow.loadURL(loginUrl);
  loginWindow.setResizable(false);
  if (process.env.NODE_ENV === 'development') {
    loginWindow.setResizable(true);
    loginWindow.webContents.openDevTools({ mode: 'undocked' });
  }

  loginWindow.on('close', (e, isExit) => {
    const isMacOs = process.platform === 'darwin';
    if (
      (isMacOs && !globalManager.forcequit.get() && !loginShouldBeClose) ||
      isExit
    ) {
      e.preventDefault();
      hide();
    }
  });
  loginWindow.on('closed', () => {
    if (process.platform !== 'darwin' || loginShouldBeClose) {
      loginWindow = undefined;
    }
  });
  loginWindow.webContents.on('new-window', (e, url) => {
    e.preventDefault();
    shell.openExternal(url);
  });
};

const show = async params => {
  if (loginWindow) {
    loginWindow.show();
  } else {
    await create(params);
    loginWindow.once('ready-to-show', () => {
      loginWindow.show();
    });
  }
};

const close = () => {
  if (loginWindow !== undefined) {
    loginWindow.close();
  }
};

const exit = () => {
  if (loginWindow !== undefined) {
    loginWindow.close(true);
  }
};

const hide = () => {
  if (loginWindow && loginWindow.hide) {
    loginWindow.hide();
  }
};

const minimize = () => {
  if (loginWindow !== undefined) {
    loginWindow.minimize();
  }
};

const send = (message, data) => {
  if (!loginWindow) {
    return;
  }
  loginWindow.webContents.send(message, data);
};

module.exports = {
  loginWindow,
  close,
  exit,
  hide,
  minimize,
  show,
  send
};
