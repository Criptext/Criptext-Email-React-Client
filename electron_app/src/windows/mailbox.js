const { app, BrowserWindow, shell } = require('electron');
const pushReceiver = require('@criptext/electron-push-receiver');
const { ipcMain: ipc } = require('@criptext/electron-better-ipc');
const windowStateManager = require('electron-window-state');
const path = require('path');
const { mailboxUrl } = require('./../window_routing');
const { appUpdater } = require('./../updater');
const globalManager = require('./../globalManager');
const { EVENTS, callEvent } = require('./events');
const { mailtoProtocolRegex } = require('./../utils/RegexUtils');
const { removeProtocolFromUrl } = require('./../utils/stringUtils');
const { API_TRACKING_EVENT } = require('./../utils/const');
const { isFromStore, isDev } = require('./windowUtils');
const {
  updateUserData,
  addEventTrack,
  NUCLEUS_EVENTS
} = require('./../nucleusManager');
const { createTrayIcon, destroyTrayIcon } = require('./tray');
const { isWindows } = require('./../utils/osUtils');

let mailboxWindow;

const mailboxSize = {
  width: 1400,
  height: 800
};

const adminUrl = 'https://admin.criptext.com/?#/account/billing';

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
    webPreferences: { webSecurity: !isDev, nodeIntegration: true }
  });
  mailboxWindow.loadURL(mailboxUrl);
  if (isWindows()) mailboxWindow.setMenuBarVisibility(false);

  // Firebase
  pushReceiver.setup({
    filename: 'firebaseConfig',
    webContents: mailboxWindow.webContents
  });
  // Context menu
  require('electron-context-menu')({
    window: mailboxWindow,
    showSaveImageAs: false,
    showInspectElement: false,
    showCopyImageAddress: false
  });

  mailboxWindow.on('page-title-updated', ev => ev.preventDefault());
  mailboxWindow.webContents.on('new-window', openLinkInDefaultBrowser);
  mailboxWindow.webContents.on('will-navigate', openLinkInDefaultBrowser);
  mailboxWindow.on('close', e => {
    if (!mailboxWindow || globalManager.forcequit.get()) {
      destroyTrayIcon();
      require('./../socketClient').disconnect();
      return;
    }
    e.preventDefault();
    if (mailboxWindow && mailboxWindow.isFullScreen()) {
      mailboxWindow.setFullScreen(false);
      setTimeout(() => hide(), 1200);
    } else {
      hide();
    }
  });
  mailboxWindow.webContents.once('did-frame-finish-load', () => {
    if (!isFromStore) appUpdater();
  });
  mailboxWindowState.manage(mailboxWindow);
};

const showFileExplorer = filename => {
  const downloadsPath = app.getPath('downloads');
  const filePath = path.join(downloadsPath, filename);
  shell.showItemInFolder(filePath);
  mailboxWindow.send('display-message-success-download');
};

const show = async ({ firstOpenApp = false }) => {
  const existVisibleWindow = BrowserWindow.getAllWindows().filter(w =>
    w.isVisible()
  );
  if (mailboxWindow) {
    mailboxWindow.show();
    createTrayIcon();
    if (firstOpenApp) {
      updateUserData();
      addEventTrack(NUCLEUS_EVENTS.MAILBOX_OPENED);
    }
  } else if (!existVisibleWindow.length || !mailboxWindow) {
    await create();
    mailboxWindow.webContents.on('dom-ready', () => {
      mailboxWindow.show();
      createTrayIcon();
      callEvent(EVENTS.API_event_tracking, API_TRACKING_EVENT.APP_OPENED);
      if (firstOpenApp) {
        updateUserData();
        addEventTrack(NUCLEUS_EVENTS.MAILBOX_OPENED);
      }
    });
    mailboxWindow.on('focus', () => {
      if (!globalManager.windowsEvents.checkDisabled()) {
        if (mailboxWindow) {
          ipc.callRenderer(mailboxWindow, 'get-events');
        }
      }
    });
  }
};

const focus = () => {
  if (mailboxWindow && mailboxWindow.focus) {
    mailboxWindow.focus();
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

const getShowPreview = async () => {
  return await ipc.callRenderer(mailboxWindow, 'get-show-preview');
};

const setShowPreview = async showPreview => {
  return await ipc.callRenderer(mailboxWindow, 'set-show-preview', showPreview);
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
  if (!mailboxWindow) return;
  mailboxWindow.minimize();
};

const send = (message, data) => {
  if (mailboxWindow && !mailboxWindow.isDestroyed()) {
    mailboxWindow.webContents.send(message, data);
  }
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
  } else if (url === adminUrl) {
    mailboxWindow.webContents.send('open-plus');
    return;
  }
  shell.openExternal(url);
};

const isVisibleAndFocused = () => {
  return mailboxWindow.isVisible() && mailboxWindow.isFocused();
};

function getWindow() {
  return mailboxWindow;
}

module.exports = {
  close,
  hide,
  focus,
  getShowPreview,
  getWindow,
  send,
  setShowPreview,
  show,
  isVisibleAndFocused,
  toggleMaximize,
  minimize,
  showFileExplorer
};
