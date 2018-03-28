const { BrowserWindow } = require('electron');
const { loadingUrl } = require('./../window_routing');
let loadingWindow;

const loadingSize = {
  width: 327,
  height: 141
};

const create = () => {
  loadingWindow = new BrowserWindow({
    width: loadingSize.width,
    height: loadingSize.height,
    show: false,
    frame: false,
    transparent: true
  });
  loadingWindow.loadURL(loadingUrl);
  loadingWindow.setMenu(null);
  loadingWindow.setResizable(false);
};

const show = async () => {
  if (loadingWindow === undefined) {
    await create();
  }
  loadingWindow.once('ready-to-show', () => {
    loadingWindow.show();
  });
};

const close = () => {
  if (loadingWindow !== undefined) {
    loadingWindow.close();
  }
  loadingWindow = undefined;
};

module.exports = {
  close,
  show
};
