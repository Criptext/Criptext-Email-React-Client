const { app, BrowserWindow, shell } = require('electron');
const {
  setup: setupPushReceiver
} = require('@criptext/electron-push-receiver');
const ipc = require('@criptext/electron-better-ipc');
const windowStateManager = require('electron-window-state');
const path = require('path');
const { mailboxUrl } = require('./../window_routing');
const { appUpdater } = require('./../updater');
const globalManager = require('./../globalManager');
const mySettings = require('./../Settings');
const { mailtoProtocolRegex } = require('./../utils/RegexUtils');
const { removeProtocolFromUrl } = require('./../utils/stringUtils');
const { isFromStore, isDev } = require('./windowUtils');
const { createTrayIcon, destroyTrayIcon } = require('./tray');
const { isWindows } = require('./../utils/osUtils');

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
    title: 'Criptext',
    frame: !isWindows(),
    webPreferences: { webSecurity: !isDev },
    backgroundColor: mySettings.theme === 'dark' ? '#2a2d32' : '#fff'
  });
  mailboxWindow.loadURL(mailboxUrl);
  // Firebase
  const firebaseFilename = 'pushNotificationConfig';
  setupPushReceiver({
    filename: firebaseFilename,
    webContents: mailboxWindow.webContents
  });

  if (isWindows()) {
    mailboxWindow.setMenuBarVisibility(false);
  }

  require('electron-context-menu')({
    window: mailboxWindow,
    showSaveImageAs: false,
    showInspectElement: false,
    showCopyImageAddress: false
  });

  mailboxWindow.on('page-title-updated', ev => {
    ev.preventDefault();
  });
  mailboxWindow.on('close', e => {
    if (!globalManager.forcequit.get()) {
      e.preventDefault();
      hide();
    } else {
      destroyTrayIcon();
      require('./../socketClient').disconnect();
    }
  });

  mailboxWindow.webContents.on('new-window', openLinkInDefaultBrowser);
  mailboxWindow.webContents.on('will-navigate', openLinkInDefaultBrowser);
  mailboxWindow.webContents.once('did-frame-finish-load', () => {
    if (!isFromStore) {
      appUpdater();
    }
  });
  mailboxWindowState.manage(mailboxWindow);
};

const showFileExplorer = filename => {
  const downloadsPath = app.getPath('downloads');
  const filePath = path.join(downloadsPath, filename);
  shell.showItemInFolder(filePath);
  mailboxWindow.send('display-message-success-download');
};

const show = async ({ accountId, recipientId }) => {
  const existVisibleWindow = BrowserWindow.getAllWindows().filter(w =>
    w.isVisible()
  );
  if (mailboxWindow) {
    const isOpened = mailboxWindow.isVisible();
    if (isOpened && accountId && recipientId) {
      send('refresh-window-logged-as', { accountId, recipientId });
    } else {
      mailboxWindow.show({});
      createTrayIcon();
    }
  } else if (!existVisibleWindow.length || !mailboxWindow) {
    await create();
    mailboxWindow.on('ready-to-show', () => {
      mailboxWindow.show({});
      createTrayIcon();
    });
    mailboxWindow.on('focus', () => {
      if (!globalManager.windowsEvents.checkDisabled()) {
        ipc.callRenderer(mailboxWindow, 'get-events');
      }
    });
  }
};

const hide = () => {
  if (mailboxWindow && mailboxWindow.hide) {
    mailboxWindow.hide();
  }
};

const close = () => {
  if (mailboxWindow !== undefined) {
    mailboxWindow.close();
  }
  mailboxWindow = undefined;
};

const toggleMaximize = () => {
  if (mailboxWindow !== undefined) {
    if (mailboxWindow.isMaximized()) {
      mailboxWindow.unmaximize();
    } else {
      mailboxWindow.maximize();
    }
  }
};

const minimize = () => {
  if (mailboxWindow !== undefined) {
    mailboxWindow.minimize();
  }
};

const send = (message, data) => {
  if (!mailboxWindow) {
    return;
  }
  mailboxWindow.webContents.send(message, data);
};

const openLinkInDefaultBrowser = (ev, url) => {
  ev.preventDefault();
  const isMailto = mailtoProtocolRegex.test(url);
  if (isMailto) {
    const emailAddress = removeProtocolFromUrl('mailto:', url);
    mailboxWindow.webContents.send('open-mailto-in-composer', {
      subject: '',
      content: '',
      emailAddress
    });
    return;
  }
  shell.openExternal(url);
};

const isVisibleAndFocused = () => {
  return mailboxWindow.isVisible() && mailboxWindow.isFocused();
};

module.exports = {
  close,
  hide,
  mailboxWindow,
  send,
  show,
  isVisibleAndFocused,
  toggleMaximize,
  minimize,
  showFileExplorer
};
