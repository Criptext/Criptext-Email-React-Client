const { BrowserWindow } = require('electron');
const path = require('path');
const { loadingUrl } = require('./../window_routing');
const globalManager = require('./../globalManager');
let loadingWindow;

const LINK_DEVICE_LOADING_TYPES = {
  LINK_NEW_DEVICE: 'link-new-device',
  LINK_OLD_DEVICE: 'link-old-device'
};

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
  if (process.env.NODE_ENV === 'development') {
    loadingWindow.setResizable(true);
    loadingWindow.webContents.openDevTools();
  } else {
    loadingWindow.setResizable(false);
  }

  loadingWindow.on('closed', () => {
    const { loadingType } = globalManager.loadingData.get();
    if (Object.values(LINK_DEVICE_LOADING_TYPES).includes(loadingType)) {
      try {
        globalManager.windowsEvents.enable();
        globalManager.loadingData.set({});
        BrowserWindow.getAllWindows().forEach(openWindow => {
          openWindow.webContents.send('enable-window-link-devices');
        });
        require('./../dataTransferClient').clearSyncData();
      } catch (e) {
        console.log('\x1b[33m%s\x1b[0m', ' ', e.name, '\n  ', e.description);
      }
    }
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
