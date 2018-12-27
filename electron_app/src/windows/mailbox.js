const { app, BrowserWindow, shell } = require('electron');
const windowStateManager = require('electron-window-state');
const { mailboxUrl } = require('./../window_routing');
const { appUpdater } = require('./../updater');
const globalManager = require('./../globalManager');
const { mailtoProtocolRegex } = require('./../utils/RegexUtils');
const { removeProtocolFromUrl } = require('./../utils/stringUtils');
const path = require('path');
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
    frame: !isWindows()
  });
  mailboxWindow.loadURL(mailboxUrl);
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
    const isMacOs = process.platform === 'darwin';
    if (isMacOs && !globalManager.forcequit.get()) {
      e.preventDefault();
      mailboxWindow.hide();
    }
    require('./../socketClient').disconnect();
  });
  mailboxWindow.on('closed', () => {
    if (process.platform !== 'darwin') {
      mailboxWindow = undefined;
    }
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
    const isStore =
      globalManager.isWindowsStore.get() || globalManager.isMAS.get();
    if (!isStore) {
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

const show = async () => {
  const existVisibleWindow = BrowserWindow.getAllWindows().filter(w => {
    return w.isVisible();
  });
  if (mailboxWindow) {
    mailboxWindow.show();
  } else if (!existVisibleWindow.length || !mailboxWindow) {
    await create();
    mailboxWindow.on('ready-to-show', () => {
      mailboxWindow.show();
    });
    mailboxWindow.on('focus', () => {
      send('check-network-status');
      if (!globalManager.windowsEvents.checkDisabled()) {
        send('get-events');
      }
    });
  }
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

const responseFromDialogWindow = response => {
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

const quit = () => {
  globalManager.forcequit.set(true);
  app.quit();
};

module.exports = {
  close,
  hide,
  mailboxWindow,
  quit,
  responseFromDialogWindow,
  send,
  show,
  isVisibleAndFocused,
  toggleMaximize,
  minimize,
  showFileExplorer
};
