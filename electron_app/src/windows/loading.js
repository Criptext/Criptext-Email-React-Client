const { BrowserWindow } = require('electron');
const path = require('path');
const { loadingUrl } = require('./../window_routing');
const globalManager = require('./../globalManager');
const {
  updateUserData,
  addEventTrack,
  NUCLEUS_EVENTS
} = require('./../nucleusManager');
let loadingWindow;

const LINK_DEVICE_LOADING_TYPES = {
  LINK_NEW_DEVICE: 'link-new-device',
  LINK_OLD_DEVICE: 'link-old-device',
  MANUAL_SYNC: 'sync-mailbox-request'
};

const iconPath = path.join(
  __dirname,
  './../../resources/launch-icons/icon.png'
);

const create = () => {
  loadingWindow = new BrowserWindow({
    icon: iconPath,
    width: 402,
    height: 266,
    show: false,
    frame: false,
    transparent: true,
    center: true,
    webPreferences: {
      nodeIntegration: true
    }
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
  updateUserData();
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

const show = async ({ type }) => {
  if (!loadingWindow) {
    await create();
  }
  loadingWindow.once('ready-to-show', () => {
    loadingWindow.show();
    sendTrack(type);
  });
};

const sendTrack = type => {
  let event;
  switch (type) {
    case 'signin-new-password':
      event = NUCLEUS_EVENTS.LOGIN_NEW_ENTERPRISE;
      break;
    case 'signup':
      event = NUCLEUS_EVENTS.LOGIN_NEW_USER;
      break;
    case 'signin':
    case 'link-new-device':
      event = NUCLEUS_EVENTS.LOGIN_NEW_DEVICE;
      break;
    default:
      event = '';
      break;
  }
  addEventTrack(event);
};

module.exports = {
  close,
  send,
  show
};
