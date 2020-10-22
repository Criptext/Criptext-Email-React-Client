const { BrowserWindow, shell } = require('electron');
const path = require('path');
const { loginUrl } = require('./../window_routing');
const { addEventTrack, NUCLEUS_EVENTS } = require('./../nucleusManager');
let loginWindow;
let shouldCloseForce = false;

const loginSize = {
  width: 350,
  height: 600
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
    transparent: true,
    webPreferences: {
      nodeIntegration: true
    }
  });
  loginWindow.loadURL(loginUrl);
  loginWindow.setResizable(false);
  if (process.env.NODE_ENV === 'development') {
    loginWindow.setResizable(true);
    loginWindow.webContents.openDevTools({ mode: 'undocked' });
  }

  loginWindow.on('close', () => {
    if (shouldCloseForce === true) {
      shouldCloseForce = false;
      return;
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
    addEventTrack(NUCLEUS_EVENTS.LOGIN_OPENED);
  } else {
    await create();
    loginWindow.once('ready-to-show', () => {
      loginWindow.show();
      addEventTrack(NUCLEUS_EVENTS.LOGIN_OPENED);
    });
    loginWindow.on('focus', () => {
      if (loginWindow) {
        loginWindow.send('get-max-devices');
      }
    });
  }
};

const close = ({ forceClose }) => {
  shouldCloseForce = forceClose;
  if (loginWindow !== undefined) {
    loginWindow.close();
    loginWindow = null;
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
  hide,
  minimize,
  show,
  send
};
