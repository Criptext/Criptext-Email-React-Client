const { BrowserWindow, shell } = require('electron');
const path = require('path');
const { loginUrl } = require('./../window_routing');
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
  loginWindow.setMenu(null);
  loginWindow.setResizable(false);
  loginWindow.on('closed', () => {
    loginWindow = undefined;
  });
  loginWindow.webContents.on('new-window', (e, url) => {
    e.preventDefault();
    shell.openExternal(url);
  });
};

const show = async () => {
  if (!loginWindow) {
    await create();
  }
  loginWindow.once('ready-to-show', () => {
    loginWindow.show();
  });
};

const close = () => {
  if (loginWindow !== undefined) {
    loginWindow.close();
  }
  loginWindow = undefined;
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

module.exports = {
  loginWindow,
  close,
  hide,
  minimize,
  responseFromModal,
  show
};
