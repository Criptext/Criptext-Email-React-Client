const { BrowserWindow, shell } = require('electron');
const { loginUrl } = require('./../window_routing');
const globalManager = require('./../globalManager');
const path = require('path');
let loginWindow;

const loginSize = {
  width: 328,
  height: 543
};

const iconPath = path.join(
  __dirname,
  './../../resources/launch-icons/icon.png'
);

const create = () => {
  loginWindow = new BrowserWindow({
    icon: iconPath,
    width: loginSize.width,
    height: loginSize.height,
    center: true,
    frame: false,
    show: false,
    transparent: true
  });
  loginWindow.loadURL(loginUrl);
  loginWindow.setResizable(false);
  if (process.env.NODE_ENV === 'development') {
    loginWindow.setResizable(true);
    loginWindow.openDevTools();
  }

  loginWindow.on('close', e => {
    if (!globalManager.forcequit.get()) {
      e.preventDefault();
      loginWindow.hide();
    }
  });
  loginWindow.on('closed', () => {
    if (process.platform !== 'darwin') {
      loginWindow = undefined;
    }
  });
  loginWindow.webContents.on('new-window', (e, url) => {
    e.preventDefault();
    shell.openExternal(url);
  });
};

const show = async () => {
  if (loginWindow) {
    loginWindow.show();
  } else {
    await create();
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

const hide = () => {
  if (loginWindow !== undefined) {
    loginWindow.hide();
  }
};

const minimize = () => {
  if (loginWindow !== undefined) {
    loginWindow.minimize();
  }
};

const responseFromModal = response => {
  loginWindow.webContents.send('selectedOption', {
    selectedOption: response
  });
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
  hide,
  minimize,
  responseFromModal,
  show,
  send
};
