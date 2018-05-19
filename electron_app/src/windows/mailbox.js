const { BrowserWindow, shell } = require('electron');
const { mailboxUrl } = require('./../window_routing');
const path = require('path');

let mailboxWindow;

const mailboxSize = {
  width: 1094,
  height: 604
};

const iconPath = path.join(
  __dirname,
  './../../resources/launch-icons/icon.png'
);

const create = () => {
  mailboxWindow = new BrowserWindow({
    icon: iconPath,
    width: mailboxSize.width,
    height: mailboxSize.height,
    show: false,
    title: ''
  });
  mailboxWindow.loadURL(mailboxUrl);
  mailboxWindow.setMenu(null);
  mailboxWindow.on('page-title-updated', event => {
    event.preventDefault();
  });
  mailboxWindow.on('closed', () => {
    mailboxWindow = undefined;
  });
  mailboxWindow.webContents.on('new-window', function(e, url) {
    e.preventDefault();
    shell.openExternal(url);
  });
  mailboxWindow.webContents.openDevTools();
};

const show = async () => {
  if (mailboxWindow === undefined) {
    await create();
  }
  mailboxWindow.once('ready-to-show', () => {
    mailboxWindow.show();
    mailboxWindow.maximize();
  });
};

const close = () => {
  if (mailboxWindow !== undefined) {
    mailboxWindow.close();
  }
  mailboxWindow = undefined;
};

const send = (message, data) => {
  if (!mailboxWindow) {
    return;
  }
  mailboxWindow.webContents.send(message, data);
};

module.exports = {
  show,
  close,
  send,
  mailboxWindow
};
