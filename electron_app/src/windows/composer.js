const { BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');
const { composerUrl } = require('./../window_routing');
const mailboxWindow = require('./mailbox');
const dbManager = require('./../DBManager');
const globalManager = require('./../globalManager');

const composerSize = {
  width: 785,
  height: 556,
  minWidth: 785,
  minHeight: 340
};

const iconPath = path.join(
  __dirname,
  './../../resources/launch-icons/icon.png'
);

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

const openNewComposer = async () => {
  const composer = await createComposerWindow();
  composer.once('ready-to-show', () => {
    composer.show();
  });
};

const createComposerWindow = () => {
  const window = new BrowserWindow({
    icon: iconPath,
    width: composerSize.width,
    height: composerSize.height,
    show: false,
    title: 'New Secure Message',
    minWidth: composerSize.minWidth,
    minHeight: composerSize.minHeight
  });
  globalManager.composerData.set(window.id, {});
  window.loadURL(composerUrl);
  window.setMenu(menu);
  window.setMenuBarVisibility(false);
  window.on('page-title-updated', event => {
    event.preventDefault();
  });
  window.showConfirmation = true;

  window.on('close', e => {
    if (window.showConfirmation && !isDraftEmpty(window.id)) {
      e.preventDefault();
      dialog.showMessageBox(dialogTemplate, async responseIndex => {
        if (responseIndex === RESPONSES.DISCARD.index) {
          window.showConfirmation = false;
          globalManager.composerData.delete(window.id);
          window.close();
        }
        if (responseIndex === RESPONSES.SAVE.index) {
          const dataDraft = globalManager.composerData.get(window.id);
          await saveDraftToDatabase(window.id, dataDraft);
          window.showConfirmation = false;
          globalManager.composerData.delete(window.id);
          window.close();
        }
      });
    } else {
      globalManager.composerData.delete(window.id);
    }
  });
  return window;
};

const isDraftEmpty = composerId => {
  const composerData = globalManager.composerData.get(composerId);
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

const saveDraftChanges = (composerId, incomingData) => {
  globalManager.composerData.set(composerId, incomingData);
};

const editDraft = async emailToEdit => {
  const newComposer = await createComposerWindow();
  globalManager.emailToEdit.set(newComposer.id, emailToEdit);
  newComposer.once('ready-to-show', () => {
    newComposer.show();
  });
};

const destroy = async ({ composerId, emailId }) => {
  const composer = BrowserWindow.fromId(composerId);
  const emailToEdit = globalManager.emailToEdit.get(composer.id);
  if (emailToEdit) {
    const { type } = emailToEdit;
    const isEditDraft = type === composerEvents.EDIT_DRAFT;
    const isReplyOrReplyAll =
      type === composerEvents.REPLY || type === composerEvents.REPLY_ALL;
    const [storedEmail] = await dbManager.getEmailByKey(emailToEdit.key);
    if (isEditDraft) {
      await dbManager.deleteEmailLabelAndContactByEmailId(
        storedEmail.id,
        undefined
      );
      sendEventoToMailbox('update-drafts', undefined);
    }
    if (isReplyOrReplyAll) {
      const dataToMailbox = {
        threadId: storedEmail.threadId,
        emailId
      };
      sendEventoToMailbox('update-thread-emails', dataToMailbox);
    }
  }
  globalManager.composerData.delete(composer.id);
  composer.destroy();
};

const sendEventoToMailbox = (eventName, data) => {
  if (mailboxWindow) {
    mailboxWindow.send(eventName, data);
  }
};

const saveDraftToDatabase = async (composerId, dataDraft) => {
  const emailToEdit = globalManager.emailToEdit.get(composerId);
  if (!emailToEdit) {
    await dbManager.createEmail(dataDraft);
  } else {
    const [prevEmail] = await dbManager.getEmailByKey(emailToEdit.key);
    await dbManager.deleteEmailLabelAndContactByEmailId(
      prevEmail.id,
      dataDraft
    );
  }
  sendEventoToMailbox('update-drafts', undefined);
};

module.exports = {
  composerEvents,
  destroy,
  editDraft,
  saveDraftChanges,
  openNewComposer
};
