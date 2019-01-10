const { BrowserWindow, dialog } = require('electron');
const path = require('path');
const { filterInvalidEmailAddresses } = require('./../utils/EmailUtils');
const { composerUrl } = require('./../window_routing');
const mailboxWindow = require('./mailbox');
const dbManager = require('./../DBManager');
const globalManager = require('./../globalManager');

const lang = require('./../lang');
const { closeWarning, windowTitle } = lang.strings.windows.composer;

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

const RESPONSES = {
  DISCARD: {
    index: 0,
    label: closeWarning.responses.discard
  },
  CONTINUE: {
    index: 1,
    label: closeWarning.responses.continue
  },
  SAVE: {
    index: 2,
    label: closeWarning.responses.save
  }
};

const dialogResponses = Object.values(RESPONSES).map(
  response => response.label
);

const dialogTemplate = {
  type: 'warning',
  title: closeWarning.title,
  buttons: dialogResponses,
  defaultId: RESPONSES.SAVE.index,
  cancelId: RESPONSES.CONTINUE.index,
  message: closeWarning.message,
  detail: closeWarning.detail
};

const composerEvents = {
  EDIT_DRAFT: 'edit-draft',
  FORWARD: 'forward',
  REPLY: 'reply',
  REPLY_ALL: 'reply-all',
  NEW_WITH_DATA: 'new-with-data'
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
    title: `  ${windowTitle}`,
    minWidth: composerSize.minWidth,
    minHeight: composerSize.minHeight
  });
  globalManager.composerData.set(window.id, {});
  window.loadURL(composerUrl);
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

  require('electron-context-menu')({
    window,
    showSaveImageAs: false,
    showInspectElement: false,
    showCopyImageAddress: false
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

const destroy = async ({
  composerId,
  emailId,
  threadId,
  hasExternalPassphrase
}) => {
  const composer = BrowserWindow.fromId(composerId);
  const emailToEdit = globalManager.emailToEdit.get(composer.id);
  if (emailToEdit) {
    const { type, key } = emailToEdit;
    if (type === composerEvents.EDIT_DRAFT) {
      const [oldDraftEmail] = await dbManager.getEmailByKey(key);
      await dbManager.deleteEmailLabelAndContactByEmailId(
        oldDraftEmail.id,
        undefined
      );
      sendEventToMailbox('update-drafts', true);
    } else if (
      type === composerEvents.REPLY ||
      type === composerEvents.REPLY_ALL
    ) {
      const dataToMailbox = {
        threadId,
        newEmailId: emailId
      };
      sendEventToMailbox('update-thread-emails', dataToMailbox);
    }
  }
  if (threadId) {
    sendEventToMailbox('display-message-email-sent', {
      threadId,
      hasExternalPassphrase
    });
  }
  globalManager.composerData.delete(composer.id);
  composer.destroy();
};

const sendEventToMailbox = (eventName, data) => {
  if (mailboxWindow) {
    mailboxWindow.send(eventName, data);
  }
};

const saveDraftToDatabase = async (composerId, data) => {
  const filteredRecipients = {
    from: data.recipients.from,
    to: filterInvalidEmailAddresses(data.recipients.to),
    cc: filterInvalidEmailAddresses(data.recipients.cc),
    bcc: filterInvalidEmailAddresses(data.recipients.bcc)
  };
  const dataDraft = Object.assign(data, { recipients: filteredRecipients });
  const emailToEdit = globalManager.emailToEdit.get(composerId);
  const { type, key } = emailToEdit || {};
  let shouldUpdateBadge = false;
  if ((!type && !key) || type !== composerEvents.EDIT_DRAFT) {
    await dbManager.createEmail(dataDraft);
    shouldUpdateBadge = true;
  } else {
    const [oldEmail] = await dbManager.getEmailByKey(key);
    const newEmailId = await dbManager.deleteEmailLabelAndContactByEmailId(
      oldEmail.id,
      dataDraft
    );
    if (type === composerEvents.EDIT_DRAFT && dataDraft.email.threadId) {
      const dataToMailbox = {
        threadId: oldEmail.threadId,
        newEmailId,
        oldEmailId: oldEmail.id
      };
      sendEventToMailbox('update-thread-emails', dataToMailbox);
      return;
    }
  }
  sendEventToMailbox('update-drafts', shouldUpdateBadge);
};

module.exports = {
  destroy,
  editDraft,
  saveDraftChanges,
  sendEventToMailbox,
  openNewComposer
};
