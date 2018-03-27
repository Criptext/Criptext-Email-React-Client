const { BrowserWindow } = require('electron');
const { composerUrl } = require('./../window_routing');
let composerWindow;

const composerSize = {
  width: 702,
  height: 556
};

const create = () => {
  composerWindow = new BrowserWindow({
    width: composerSize.width,
    height: composerSize.height,
    show: false,
    title: 'New Secure Message'
  });
  composerWindow.loadURL(composerUrl);
  composerWindow.setMenu(null);
  composerWindow.on('page-title-updated', event => {
    event.preventDefault();
  });
  composerWindow.on('closed', () => {
    composerWindow = undefined;
  });
  composerWindow.toggleDevTools();
};

const show = async () => {
  if (composerWindow === undefined) {
    await create();
  }
  composerWindow.once('ready-to-show', () => {
    composerWindow.show();
  });
};

const close = () => {
  if (composerWindow !== undefined) {
    composerWindow.close();
  }
  composerWindow = undefined;
};

const send = (message, data) => {
  if(!composerWindow){
    return;
  }
  composerWindow.webContents.send(message, data)
}

module.exports = {
  close,
  show,
  send
};
