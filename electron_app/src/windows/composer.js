const { BrowserWindow, Menu, dialog } = require('electron');
const { composerUrl } = require('./../window_routing');
const mailboxWindow = require('./mailbox');
const dbManager = require('./../DBManager');
const globalManager = require('./../globalManager');

let composerWindow;
let showConfirmation;

const composerSize = {
  width: 785,
  height: 556,
  minWidth: 785,
  minHeight: 340
};

const template = [
  {
    submenu: [
      { role: 'undo', accelerator: 'CmdOrCtrl+Z', visible: false },
      {
        role: 'redo',
        accelerator: process.platform === 'darwin' ? 'Cmd+Shift+Z' : 'Ctrl+Y',
        visible: false
      },
      { role: 'cut', accelerator: 'CmdOrCtrl+X', visible: false },
      { role: 'copy', accelerator: 'CmdOrCtrl+C', visible: false },
      { role: 'paste', accelerator: 'CmdOrCtrl+V', visible: false },
      {
        role: 'pasteandmatchstyle',
        accelerator: 'CmdOrCtrl+Shift+V',
        visible: false
      }
    ]
  }
];
const menu = Menu.buildFromTemplate(template);

const RESPONSES = {
  DISCARD: {
    index: 0,
    label: 'Discard changes'
  },
  CONTINUE: {
    index: 1,
    label: 'Continue writing'
  },
  SAVE: {
    index: 2,
    label: 'Save as Draft'
  }
};

const dialogResponses = Object.values(RESPONSES).map(
  response => response.label
);

const dialogTemplate = {
  type: 'warning',
  title: 'Warning',
  buttons: dialogResponses,
  message: 'You are closing a message that has not been sent',
  detail:
    "To save the message, click on 'Save as Draft'. The message will be saved on your Drafts folder"
};

const composerEvents = {
  EDIT_DRAFT: 'edit-draft',
  REPLY: 'reply',
  REPLY_ALL: 'reply-all',
  FORWARD: 'forward'
};

const create = () => {
  showConfirmation = true;
  globalManager.composerData.set({});
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
  composerWindow.setMenuBarVisibility(false);
  composerWindow.on('page-title-updated', event => {
    event.preventDefault();
  });

  composerWindow.on('close', e => {
    if (showConfirmation && !isDraftEmpty()) {
      e.preventDefault();
      dialog.showMessageBox(dialogTemplate, async responseIndex => {
        if (responseIndex === RESPONSES.DISCARD.index) {
          showConfirmation = false;
          globalManager.composerData.set({});
          composerWindow.close();
        }
        if (responseIndex === RESPONSES.SAVE.index) {
          await saveDraftToDatabase(global.composerData);
          showConfirmation = false;
          globalManager.composerData.set({});
          composerWindow.close();
        }
      });
    } else {
      composerWindow = undefined;
      setEmptyVariables();
    }
  });
};

const close = () => {
  if (composerWindow !== undefined) {
    composerWindow.close();
  }
  setEmptyVariables();
  composerWindow = undefined;
};

const destroy = async () => {
  if (composerWindow !== undefined) {
    composerWindow.destroy();
  }
  const emailToEdit = globalManager.emailToEdit.get();
  if (emailToEdit && emailToEdit.type === composerEvents.EDIT_DRAFT) {
    const [prevEmail] = await dbManager.getEmailByKey(emailToEdit.key);
    await dbManager.deleteEmailLabelAndContactByEmailId(
      prevEmail.id,
      undefined
    );
  }
  if (mailboxWindow) {
    mailboxWindow.send('update-drafts');
  }
  setEmptyVariables();
  composerWindow = undefined;
};

const send = (message, data) => {
  if (!composerWindow) {
    return;
  }
  composerWindow.webContents.send(message, data);
};

const editDraft = async emailToEdit => {
  globalManager.emailToEdit.set(emailToEdit);
  await show();
};

const isDraftEmpty = () => {
  const composerData = globalManager.composerData.get();
  if (composerData === {}) {
    return true;
  }
  const { recipients, email } = composerData;
  if (recipients === undefined || email === undefined) {
    return true;
  }
  let preview = email.preview;
  const subject = email.subject;
  preview = preview.replace('\n', '');
  const hasRecipients =
    recipients.to.length > 0 ||
    recipients.cc.length > 0 ||
    recipients.bcc.length > 0;
  return !hasRecipients && !subject.length && !preview.length;
};

const saveDraftChanges = incomingData => {
  globalManager.composerData.set(incomingData);
};

const saveDraftToDatabase = async dataDraft => {
  const emailToEdit = globalManager.emailToEdit.get();
  if (!emailToEdit) {
    await dbManager.createEmail(dataDraft);
  } else {
    const [prevEmail] = await dbManager.getEmailByKey(emailToEdit.key);
    await dbManager.deleteEmailLabelAndContactByEmailId(
      prevEmail.id,
      dataDraft
    );
  }
  if (mailboxWindow) {
    mailboxWindow.send('update-drafts');
  }
};

const setEmptyVariables = () => {
  globalManager.composerData.set({});
  globalManager.emailToEdit.set(undefined);
};

const show = async () => {
  if (composerWindow === undefined) {
    await create();
  }
  composerWindow.once('ready-to-show', () => {
    composerWindow.show();
  });
};

module.exports = {
  close,
  destroy,
  show,
  send,
  saveDraftChanges,
  editDraft,
  composerEvents
};
