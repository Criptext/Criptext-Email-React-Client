const { BrowserWindow } = require('electron');
const { loginUrl } = require('./../window_routing');
let loginWindow;

const loginSize = {
  width: 328,
  height: 543
};

const create = () => {
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
};

const show = async () => {
  if (loginWindow === undefined) {
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
  minimize,
  responseFromModal,
  show
};
