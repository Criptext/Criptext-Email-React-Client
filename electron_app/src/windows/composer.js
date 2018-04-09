const { BrowserWindow, Menu, dialog, nativeImage } = require('electron');
const { composerUrl } = require('./../window_routing');
const dbManager = require('./../DBManager');
let composerWindow;
let composerData = {};
let showConfirmation = true;

const composerSize = {
  width: 785,
  height: 556,
  minWidth: 785,
  minHeight: 340
};

const template = [
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'pasteandmatchstyle' },
      { role: 'delete' },
      { role: 'selectall' }
    ]
  }
];
const menu = Menu.buildFromTemplate(template);

const dialogTemplate = {
  icon: nativeImage.createFromPath('./../assets/icon.png'),
  title: 'Warning',
  buttons: ['Discard changes', 'Continue writing', 'Save as Draft'],
  message: 'You are closing a message that has not been sent',
  detail:
    "To save the message, click on 'Save as Draft'. The message will be saved on your Drafts folder"
};

const create = () => {
  showConfirmation = true;
  composerWindow = new BrowserWindow({
    width: composerSize.width,
    height: composerSize.height,
    show: false,
    title: 'New Secure Message',
    minWidth: composerSize.minWidth,
    minHeight: composerSize.minHeight
  });
  composerWindow.loadURL(composerUrl);
  composerWindow.setMenu(menu);
  composerWindow.on('page-title-updated', event => {
    event.preventDefault();
  });

  composerWindow.on('close', e => {
    if (showConfirmation) {
      e.preventDefault();
      dialog.showMessageBox(dialogTemplate, async responseIndex => {
        if (responseIndex === 0) {
          showConfirmation = false;
          composerData = {};
          close();
        }
        if (responseIndex === 2) {
          await saveDraftToDatabase(composerData);
          showConfirmation = false;
          close();
        }
      });
    }
  });
  //composerWindow.webContents.openDevTools();
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
  if (!composerWindow) {
    return;
  }
  composerWindow.webContents.send(message, data);
};

const saveDraftChanges = incomingData => {
  composerData = incomingData;
};

const saveDraftToDatabase = async dataDraft => {
  await dbManager.createEmail(dataDraft);
};

module.exports = {
  close,
  show,
  send,
  saveDraftChanges
};
