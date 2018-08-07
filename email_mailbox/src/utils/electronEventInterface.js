import {
  acknowledgeEvents,
  createEmail,
  createEmailLabel,
  getEmailByKey,
  getEmailLabelsByEmailId,
  LabelType,
  getContactByEmails,
  createFeedItem,
  myAccount,
  updateEmail,
  getLabelByText,
  updateAccount
} from './electronInterface';
import {
  formEmailLabel,
  formFilesFromData,
  formIncomingEmailFromData,
  getRecipientsFromData,
  validateEmailStatusToSet,
  checkEmailIsTo
} from './EmailUtils';
import { SocketCommand, appDomain, EmailStatus } from './const';
import Messages from './../data/message';
import { MessageType } from './../components/Message';

const EventEmitter = window.require('events');
const electron = window.require('electron');
const { ipcRenderer } = electron;
const emitter = new EventEmitter();

ipcRenderer.on('socket-message', (ev, message) => {
  handleEvent(message);
});

export const handleEvent = incomingEvent => {
  switch (incomingEvent.cmd) {
    case SocketCommand.NEW_EMAIL: {
      return handleNewMessageEvent(incomingEvent);
    }
    case SocketCommand.EMAIL_TRACKING_UPDATE: {
      return handleEmailTrackingUpdate(incomingEvent);
    }
    case SocketCommand.SEND_EMAIL_ERROR: {
      return handleSendEmailError(incomingEvent);
    }
    case SocketCommand.PEER_EMAIL_UNSEND: {
      return handlePeerEmailUnsend(incomingEvent);
    }
    case SocketCommand.PEER_EMAIL_READ_UPDATE: {
      return handlePeerEmailRead(incomingEvent);
    }
    case SocketCommand.PEER_LABEL_CREATED: {
      return handlePeerLabelCreated(incomingEvent);
    }
    case SocketCommand.PEER_USER_NAME_CHANGED: {
      return handlePeerUserNameChanged(incomingEvent);
    }
    default: {
      return;
    }
  }
};

const handleNewMessageEvent = async ({ rowid, params }) => {
  const [emailObj, eventId] = [params, rowid];
  const InboxLabel = LabelType.inbox.id;
  const SentLabel = LabelType.sent.id;
  let eventParams = {};
  const [prevEmail] = await getEmailByKey(emailObj.metadataKey);
  if (!prevEmail) {
    const incomingEmail = await formIncomingEmailFromData(emailObj);
    let email = incomingEmail.email;
    const fileKeyParams = incomingEmail.fileKeyParams;

    const recipients = getRecipientsFromData(emailObj);
    const files =
      emailObj.files && emailObj.files.length
        ? await formFilesFromData({
            files: emailObj.files,
            date: emailObj.date
          })
        : null;

    const labels = [];
    const isToMe = checkEmailIsTo(emailObj, 'to');
    if (isToMe) {
      labels.push(InboxLabel);
    }
    const isFromMe = checkEmailIsTo(emailObj, 'from');
    if (isFromMe) {
      labels.push(SentLabel);
    }
    if (isFromMe && isToMe) {
      email = { ...email, unread: false };
    }

    const params = {
      email,
      recipients,
      labels,
      files,
      fileKeyParams
    };
    const [newEmailId] = await createEmail(params);
    eventParams = {
      ...eventParams,
      threadId: emailObj.threadId,
      emailId: newEmailId,
      labels
    };
  } else {
    const labels = [];
    const prevEmailLabels = await getEmailLabelsByEmailId(prevEmail.id);
    const prevLabels = prevEmailLabels.map(item => item.labelId);

    const isToMe = checkEmailIsTo(emailObj, 'to');
    const hasInboxLabel = prevLabels.includes(InboxLabel);
    if (isToMe && !hasInboxLabel) {
      labels.push(InboxLabel);
    }
    const isFromMe = checkEmailIsTo(emailObj, 'from');
    const hasSentLabel = prevLabels.includes(SentLabel);
    if (isFromMe && !hasSentLabel) {
      labels.push(SentLabel);
    }
    if (labels.length) {
      const emailLabel = formEmailLabel({ emailId: prevEmail.id, labels });
      await createEmailLabel(emailLabel);
    }

    eventParams = {
      ...eventParams,
      threadId: prevEmail.threadId,
      emailId: prevEmail.id,
      labels
    };
  }
  await setEventAsHandled(eventId);
  emitter.emit(Event.NEW_EMAIL, eventParams);
};

const handleEmailTrackingUpdate = async ({ rowid, params }) => {
  const { date, metadataKey, type } = params;
  const recipientId = params.from;
  const [email] = await getEmailByKey(metadataKey);
  if (email) {
    const content = type === EmailStatus.UNSEND ? '' : null;
    const preview = type === EmailStatus.UNSEND ? '' : null;
    const status = validateEmailStatusToSet(email.status, type);
    const unsendDate = type === EmailStatus.UNSEND ? date : null;
    await updateEmail({
      key: metadataKey,
      status,
      content,
      preview,
      unsendDate
    });
    const isFromMe = recipientId === myAccount.recipientId;
    const isOpened = type === EmailStatus.OPENED;
    if (!isFromMe && isOpened) {
      const contactEmail = `${recipientId}@${appDomain}`;
      const [contact] = await getContactByEmails([contactEmail]);
      const feedItemParams = {
        date,
        type,
        emailId: email.id,
        contactId: contact.id
      };
      await createFeedItem([feedItemParams]);
    }
    await setEventAsHandled(rowid);
    emitter.emit(Event.EMAIL_TRACKING_UPDATE, email.id, type, date);
  }
};

const handlePeerEmailUnsend = async ({ rowid, params }) => {
  const { metadataKey, date } = params;
  const [email] = await getEmailByKey(metadataKey);
  if (email) {
    const status = validateEmailStatusToSet(email.status, params.type);
    await updateEmail({
      key: metadataKey,
      content: '',
      preview: '',
      status,
      unsendDate: date
    });
    await setEventAsHandled(rowid);
    emitter.emit(Event.EMAIL_TRACKING_UPDATE, email.id, params.type, date);
  }
};

const handlePeerEmailRead = async ({ rowid, params }) => {
  const { metadataKeys, unread } = params;
  for (const metadataKey of metadataKeys) {
    const [email] = await getEmailByKey(metadataKey);
    if (email) {
      await updateEmail({
        key: metadataKey,
        unread: unread
      });
      await setEventAsHandled(rowid);
    }
  }
};

const handlePeerLabelCreated = async ({ rowid, params }) => {
  const { text, color } = params;
  const [label] = await getLabelByText(text);
  if (!label) {
    await emitter.emit(Event.LABEL_CREATED, { text, color, visible: true });
  }
  await setEventAsHandled(rowid);
};

const handlePeerUserNameChanged = async ({ rowid, params }) => {
  const { name } = params;
  const { recipientId } = myAccount;
  await updateAccount({ name, recipientId });
  await setEventAsHandled(rowid);
};

const handleSendEmailError = async ({ rowid }) => {
  await setEventAsHandled(rowid);
};

const setEventAsHandled = async eventId => {
  return await acknowledgeEvents([eventId]);
};

/* Window events
  ----------------------------- */

ipcRenderer.on('update-drafts', () => {
  emitter.emit(Event.UPDATE_SAVED_DRAFTS);
});

ipcRenderer.on('display-message-email-sent', (ev, { emailId }) => {
  const messageData = {
    ...Messages.success.emailSent,
    type: MessageType.SUCCESS,
    params: { emailId }
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
});

ipcRenderer.on('display-message-success-download', () => {
  const messageData = {
    ...Messages.success.downloadFile,
    type: MessageType.SUCCESS
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
});

ipcRenderer.on('display-message-error-download', () => {
  const messageData = {
    ...Messages.error.downloadFile,
    type: MessageType.ERROR
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
});

ipcRenderer.on('failed-to-send', () => {
  const messageData = {
    ...Messages.error.failedToSend,
    type: MessageType.ERROR
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
});

ipcRenderer.on('update-thread-emails', (ev, data) => {
  const { threadId, newEmailId, oldEmailId } = data;
  emitter.emit(Event.UPDATE_THREAD_EMAILS, {
    threadId,
    newEmailId,
    oldEmailId
  });
});

export const addEvent = (eventName, callback) => {
  emitter.addListener(eventName, callback);
};

export const removeEvent = eventName => {
  emitter.removeEvent(eventName);
};

export const Event = {
  NEW_EMAIL: 'new-email',
  UPDATE_SAVED_DRAFTS: 'update-drafts',
  EMAIL_TRACKING_UPDATE: 'email-tracking-update',
  UPDATE_EMAILS: 'update-emails',
  DISPLAY_MESSAGE: 'display-message',
  LABEL_CREATED: 'label-created'
};
