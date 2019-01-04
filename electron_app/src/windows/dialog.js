const { BrowserWindow } = require('electron');
const { modalUrl } = require('./../window_routing');
const loginWindow = require('./login');
let dialogWindow;

const dialogSize = {
  width: 400,
  height: 280
};

const create = () => {
  dialogWindow = new BrowserWindow({
    parent: loginWindow.loginWindow,
    width: dialogSize.width,
    height: dialogSize.height,
    show: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true
  });
  dialogWindow.loadURL(modalUrl);
  dialogWindow.setMenu(null);
  dialogWindow.setResizable(false);
  if (process.env.NODE_ENV === 'development') {
    dialogWindow.setResizable(true);
    dialogWindow.webContents.openDevTools({ mode: 'undocked' });
  }
};

const show = async () => {
  if (dialogWindow === undefined) {
    await create();
  }
  dialogWindow.once('ready-to-show', () => {
    dialogWindow.show();
  });
};

const close = () => {
  if (dialogWindow !== undefined) {
    dialogWindow.close();
  }
  dialogWindow = undefined;
};

module.exports = {
  close,
  show
};
