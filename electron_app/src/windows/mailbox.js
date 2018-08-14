const { app, BrowserWindow, shell } = require('electron');
const windowStateManager = require('electron-window-state');
const { mailboxUrl } = require('./../window_routing');
const { appUpdater } = require('./../updater');
const path = require('path');
const opn = require('opn');

let mailboxWindow;

const mailboxSize = {
  width: 1400,
  height: 800
};

const iconPath = path.join(
  __dirname,
  './../../resources/launch-icons/icon.png'
);

const create = () => {
  const mailboxWindowState = windowStateManager({
    defaultWidth: mailboxSize.width,
    defaultHeight: mailboxSize.height,
    file: 'mailbox-state.json'
  });

  mailboxWindow = new BrowserWindow({
    x: mailboxWindowState.x,
    y: mailboxWindowState.y,
    width: mailboxWindowState.width,
    height: mailboxWindowState.height,
    icon: iconPath,
    show: false,
    title: ''
  });
  mailboxWindow.loadURL(mailboxUrl);

  mailboxWindow.on('page-title-updated', ev => {
    ev.preventDefault();
  });
  mailboxWindow.on('closed', () => {
    mailboxWindow = undefined;
  });

  mailboxWindow.webContents.on('new-window', openLinkInDefaultBrowser);
  mailboxWindow.webContents.on('will-navigate', openLinkInDefaultBrowser);

  mailboxWindow.webContents.session.on('will-download', (ev, item) => {
    const downloadsPath = app.getPath('downloads');
    const filename = item.getFilename();
    const filePath = path.join(downloadsPath, filename);
    item.setSavePath(filePath);
    item.once('done', (e, state) => {
      if (state === 'completed') {
        shell.showItemInFolder(filePath);
        mailboxWindow.send('display-message-success-download');
      } else {
        mailboxWindow.send('display-message-error-download');
      }
    });
  });
  mailboxWindow.webContents.once('did-frame-finish-load', () => {
    const checkOS = isWindowsOrmacOS();
    if (checkOS) {
      appUpdater();
    }
  });
  mailboxWindowState.manage(mailboxWindow);
};

const show = async () => {
  if (!mailboxWindow) {
    await create();
  }
  mailboxWindow.once('ready-to-show', () => {
    mailboxWindow.show();
  });
};

const hide = () => {
  if (mailboxWindow !== undefined) {
    mailboxWindow.hide();
  }
};

const close = () => {
  if (mailboxWindow !== undefined) {
    mailboxWindow.close();
  }
  mailboxWindow = undefined;
};

const responseFromModal = response => {
  mailboxWindow.webContents.send('selectedOption', {
    selectedOption: response
  });
};

const send = (message, data) => {
  if (!mailboxWindow) {
    return;
  }
  mailboxWindow.webContents.send(message, data);
};

const isWindowsOrmacOS = () => {
  return process.platform === 'darwin' || process.platform === 'win32';
};

const openLinkInDefaultBrowser = (ev, url) => {
  ev.preventDefault();
  opn(url);
};

module.exports = {
  show,
  hide,
  close,
  send,
  responseFromModal,
  mailboxWindow
};
