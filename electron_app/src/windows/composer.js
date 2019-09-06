const path = require('path');
const { BrowserWindow } = require('electron');
const myAccount = require('../Account');
const { composerUrl } = require('./../window_routing');
const dbManager = require('./../DBManager');
const globalManager = require('./../globalManager');
const fileUtils = require('../utils/FileUtils');
const { APP_DOMAIN } = require('../utils/const');
const { filterInvalidEmailAddresses } = require('./../utils/EmailUtils');

const lang = require('./../lang');
const { windowTitle } = lang.strings.windows.composer;

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
  window.saved = false;

  window.on('close', async e => {
    try {
      if (!window.saved && !isDraftEmpty(window.id)) {
        e.preventDefault();
        const dataDraft = globalManager.composerData.get(window.id);
        await saveDraftToDatabase(window.id, dataDraft);
        window.saved = true;
        globalManager.composerData.delete(window.id);
        sendEventToMailbox('save-draft-success');
        window.close();
      } else {
        globalManager.composerData.delete(window.id);
      }
    } catch (error) {
      sendEventToMailbox('save-draft-failed');
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
  discard,
  emailId,
  threadId,
  hasExternalPassphrase
}) => {
  const composer = BrowserWindow.fromId(composerId);
  const emailToEdit = globalManager.emailToEdit.get(composer.id);
  let event = 'composer-email-sent';
  let params = {
    type: 'new-email',
    threadId,
    hasExternalPassphrase
  };
  if (emailToEdit) {
    const { type, key } = emailToEdit;
    if (type === composerEvents.EDIT_DRAFT) {
      const [oldDraftEmail] = await dbManager.getEmailByKey(key);
      if (oldDraftEmail) {
        const oldEmailId = oldDraftEmail.id;
        await dbManager.deleteEmailLabelAndContactByEmailId(
          oldEmailId,
          undefined
        );
      }
      event = 'composer-email-delete';
      params = { threadId };
    } else if (
      type === composerEvents.REPLY ||
      type === composerEvents.REPLY_ALL
    ) {
      if (discard) {
        params.threadId = undefined;
      } else {
        params.type = 'reply';
        params.threadData = {
          threadId,
          newEmailId: emailId
        };
      }
    }
  }
  sendEventToMailbox(event, params);
  globalManager.composerData.delete(composer.id);
  composer.destroy();
};

const sendEventToMailbox = (eventName, data) => {
  const mailboxWindow = require('./mailbox');
  if (mailboxWindow && mailboxWindow.send) {
    mailboxWindow.send(eventName, data);
  }
};

const saveDraftToDatabase = async (composerId, data) => {
  const recipientId = myAccount.recipientId;
  const username = recipientId.includes('@')
    ? recipientId
    : `${recipientId}@${APP_DOMAIN}`;
  const filteredRecipients = {
    from: data.recipients.from,
    to: filterInvalidEmailAddresses(data.recipients.to),
    cc: filterInvalidEmailAddresses(data.recipients.cc),
    bcc: filterInvalidEmailAddresses(data.recipients.bcc)
  };
  const content = data.body;
  const dataDraft = Object.assign(data, { recipients: filteredRecipients });
  const emailToEdit = globalManager.emailToEdit.get(composerId);
  const { type, key } = emailToEdit || {};
  let shouldUpdateBadge = false;
  if ((!type && !key) || type !== composerEvents.EDIT_DRAFT) {
    await dbManager.createEmail(dataDraft);
    await fileUtils.saveEmailBody({
      body: content,
      username,
      metadataKey: parseInt(dataDraft.email.key)
    });
    shouldUpdateBadge = true;
  } else {
    const [oldEmail] = await dbManager.getEmailByKey(key);
    const newDataDraft = Object.assign(dataDraft, {
      email: Object.assign(dataDraft.email, { key: oldEmail.key })
    });
    const newEmailId = await dbManager.deleteEmailLabelAndContactByEmailId(
      oldEmail.id,
      newDataDraft
    );
    await fileUtils.saveEmailBody({
      body: content,
      username,
      metadataKey: parseInt(newDataDraft.email.key)
    });
    if (type === composerEvents.EDIT_DRAFT && newDataDraft.email.threadId) {
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
