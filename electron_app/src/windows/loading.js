const { BrowserWindow } = require('electron');
const path = require('path');
const { loadingUrl } = require('./../window_routing');
let loadingWindow;

const loadingSize = {
  width: 327 + 350,
  height: 141 + 350
};

const iconPath = path.join(
  __dirname,
  './../../resources/launch-icons/icon.png'
);

const create = () => {
  loadingWindow = new BrowserWindow({
    icon: iconPath,
    width: loadingSize.width,
    height: loadingSize.height,
    show: false
    // frame: false,
    // transparent: true
  });
  loadingWindow.loadURL(loadingUrl);
  // loadingWindow.setMenu(null);
  // loadingWindow.setResizable(false);
};

const close = () => {
  if (loadingWindow !== undefined) {
    loadingWindow.close();
  }
  loadingWindow = undefined;
};

const send = (message, data) => {
  if (!loadingWindow) {
    return;
  }
  loadingWindow.webContents.send(message, data);
};

const show = async () => {
  if (loadingWindow === undefined) {
    await create();
  }
  loadingWindow.once('ready-to-show', () => {
    loadingWindow.show();
  });
};

module.exports = {
  close,
  send,
  show
};
