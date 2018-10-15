const { BrowserWindow } = require('electron');
const path = require('path');
const { loadingUrl } = require('./../window_routing');
const globalManager = require('./../globalManager');
const dataTransferClient = require('./../dataTransferClient');
let loadingWindow;

const iconPath = path.join(
  __dirname,
  './../../resources/launch-icons/icon.png'
);

const create = () => {
  const { width, height } = globalManager.screenSize.get();
  loadingWindow = new BrowserWindow({
    icon: iconPath,
    width,
    height,
    show: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true
  });
  loadingWindow.loadURL(loadingUrl);
  loadingWindow.setMenu(null);
  loadingWindow.setResizable(false);

  loadingWindow.on('closed', () => {
    globalManager.windowsEvents.enable();
    globalManager.loadingData.set({});
    BrowserWindow.getAllWindows().forEach(openWindow => {
      openWindow.webContents.send('enable-window-link-devices');
    });
    dataTransferClient.clearSyncData();
  });
};

const close = () => {
  if (loadingWindow) {
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
  if (!loadingWindow) {
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
