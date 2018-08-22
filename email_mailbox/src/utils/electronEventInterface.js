import signal from './../libs/signal';
import {
  acknowledgeEvents,
  createEmail,
  createEmailLabel,
  getEmailByKey,
  getEmailsByKeys,
  getEmailLabelsByEmailId,
  LabelType,
  getContactByEmails,
  createFeedItem,
  myAccount,
  updateEmail,
  updateEmails,
  getLabelsByText,
  updateAccount,
  updateFilesByEmailId,
  deleteEmailsByThreadId,
  deleteEmailByKey,
  updateUnreadEmailByThreadId,
  getEmailsByThreadId,
  deleteEmailLabel
} from './electronInterface';
import { EmailUtils } from './electronUtilsInterface';
import {
  formEmailLabel,
  formFilesFromData,
  validateEmailStatusToSet
} from './EmailUtils';
import { SocketCommand, appDomain, EmailStatus } from './const';
import Messages from './../data/message';
import { MessageType } from './../components/Message';
import { AttachItemStatus } from '../components/AttachItem';

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
    case SocketCommand.PEER_THREAD_READ_UPDATE: {
      return handlePeerThreadRead(incomingEvent);
    }
    case SocketCommand.PEER_EMAIL_LABELS_UPDATE: {
      return handlePeerEmailLabelsUpdate(incomingEvent);
    }
    case SocketCommand.PEER_THREAD_LABELS_UPDATE: {
      return handlePeerThreadLabelsUpdate(incomingEvent);
    }
    case SocketCommand.PEER_EMAIL_DELETED_PERMANENTLY: {
      return handlePeerEmailDeletedPermanently(incomingEvent);
    }
    case SocketCommand.PEER_THREAD_DELETED_PERMANENTLY: {
      return handlePeerThreadDeletedPermanently(incomingEvent);
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
  const {
    bcc,
    cc,
    date,
    fileKey,
    files,
    from,
    messageType,
    metadataKey,
    subject,
    senderDeviceId,
    threadId,
    to
  } = params;
  const recipientId = EmailUtils.getRecipientIdFromEmailAddressTag(from);
  const [prevEmail] = await getEmailByKey(metadataKey);
  const InboxLabel = LabelType.inbox.id;
  const SentLabel = LabelType.sent.id;
  const isToMe = EmailUtils.checkEmailIsTo({ to, cc, bcc, type: 'to' });
  const isFromMe = EmailUtils.checkEmailIsTo({ from, type: 'from' });
  let eventParams = { isToMe };

  if (!prevEmail) {
    const body = await signal.decryptEmail({
      bodyKey: metadataKey,
      recipientId,
      deviceId: senderDeviceId,
      messageType
    });
    let fileKeyParams;
    if (fileKey) {
      const decrypted = await signal.decryptFileKey({
        fileKey,
        messageType,
        recipientId,
        deviceId: senderDeviceId
      });
      const [key, iv] = decrypted.split(':');
      fileKeyParams = { key, iv };
    }
    const unread = isFromMe && !isToMe ? false : true;
    const data = {
      bcc,
      body,
      cc,
      date,
      from,
      isToMe,
      metadataKey,
      deviceId: senderDeviceId,
      subject,
      to,
      threadId,
      unread
    };
    const { email, recipients } = await EmailUtils.formIncomingEmailFromData(
      data
    );
    const filesData =
      files && files.length
        ? await formFilesFromData({
            files,
            date
          })
        : null;

    const labels = [];
    if (isToMe) {
      labels.push(InboxLabel);
    }
    if (isFromMe) {
      labels.push(SentLabel);
    }

    const emailData = {
      email,
      labels,
      files: filesData,
      fileKeyParams,
      recipients
    };
    const [newEmailId] = await createEmail(emailData);
    eventParams = {
      ...eventParams,
      emailId: newEmailId,
      labels,
      threadId
    };
    emitter.emit(Event.NEW_EMAIL, eventParams);
  } else {
    const labels = [];
    const prevEmailLabels = await getEmailLabelsByEmailId(prevEmail.id);
    const prevLabels = prevEmailLabels.map(item => item.labelId);

    const hasInboxLabel = prevLabels.includes(InboxLabel);
    if (isToMe && !hasInboxLabel) {
      labels.push(InboxLabel);
    }

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
      emailId: prevEmail.id,
      labels,
      threadId: prevEmail.threadId
    };
  }
  await setEventAsHandled(rowid);
};

const handleEmailTrackingUpdate = async ({ rowid, params }) => {
  const { date, metadataKey, type } = params;
  const recipientId = params.from;
  const [email] = await getEmailByKey(metadataKey);
  if (email) {
    const isUnsend = type === EmailStatus.UNSEND;
    const content = isUnsend ? '' : null;
    const preview = isUnsend ? '' : null;
    const status = validateEmailStatusToSet(email.status, type);
    const unsendDate = isUnsend ? date : null;
    await updateEmail({
      key: metadataKey,
      status,
      content,
      preview,
      unsendDate
    });
    if (isUnsend) {
      await updateFilesByEmailId({
        emailId: email.id,
        status: AttachItemStatus.UNSENT
      });
    }
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
    emitter.emit(Event.EMAIL_TRACKING_UPDATE, email.id, type, date);
  }
  await setEventAsHandled(rowid);
};

const handlePeerEmailUnsend = async ({ rowid, params }) => {
  const type = EmailStatus.UNSEND;
  const { metadataKey, date } = params;
  const [email] = await getEmailByKey(metadataKey);
  if (email) {
    const status = validateEmailStatusToSet(email.status, type);
    await updateEmail({
      key: metadataKey,
      content: '',
      preview: '',
      status,
      unsendDate: date
    });
    await updateFilesByEmailId({
      emailId: email.id,
      status: AttachItemStatus.UNSENT
    });
    emitter.emit(Event.EMAIL_TRACKING_UPDATE, email.id, type, date);
  }
  await setEventAsHandled(rowid);
};

const handlePeerEmailRead = async ({ rowid, params }) => {
  const { metadataKeys, unread } = params;
  const emails = await getEmailsByKeys(metadataKeys);
  const emailKeys = emails.map(email => email.key);
  await updateEmails({
    keys: emailKeys,
    unread: !!unread
  });
  const eventParams = {
    labelId: LabelType.inbox.id,
    operation: unread ? 'add' : 'less',
    value: emailKeys.length
  };
  emitter.emit(Event.REFRESH_THREADS, emailKeys.length ? eventParams : null);
  await setEventAsHandled(rowid);
};

const handlePeerThreadRead = async ({ rowid, params }) => {
  const { threadIds, unread } = params;
  for (const threadId of threadIds) {
    await updateUnreadEmailByThreadId(threadId, !!unread);
  }
  await setEventAsHandled(rowid);
  emitter.emit(Event.THREADS_UPDATE_READ, threadIds, !!unread);
};

const handlePeerEmailLabelsUpdate = async ({ rowid, params }) => {
  const { metadataKeys, labelsRemoved, labelsAdded } = params;
  const emailsId = [];
  for (const metadataKey of metadataKeys) {
    const [email] = await getEmailByKey(metadataKey);
    if (email) {
      emailsId.push(email.id);
    }
  }
  const labelsToRemove = await getLabelsByText(labelsRemoved);
  const labelIdsToRemove = labelsToRemove.map(label => label.id);

  const labelsToAdd = await getLabelsByText(labelsAdded);
  const labelIdsToAdd = labelsToAdd.map(label => label.id);

  await formAndSaveEmailLabelsUpdate({
    emailsId,
    labelIdsToAdd,
    labelIdsToRemove
  });
  await setEventAsHandled(rowid);
};

const handlePeerThreadLabelsUpdate = async ({ rowid, params }) => {
  const { threadIds, labelsRemoved, labelsAdded } = params;
  let allEmailsIds = [];
  for (const threadId of threadIds) {
    const emails = await getEmailsByThreadId(threadId);
    const emailIds = emails.map(email => email.id);
    allEmailsIds = [...allEmailsIds, ...emailIds];
  }
  const labelsToRemove = await getLabelsByText(labelsRemoved);
  const labelIdsToRemove = labelsToRemove.map(label => label.id);

  const labelsToAdd = await getLabelsByText(labelsAdded);
  const labelIdsToAdd = labelsToAdd.map(label => label.id);

  await formAndSaveEmailLabelsUpdate({
    emailsId: allEmailsIds,
    labelIdsToAdd,
    labelIdsToRemove
  });
  await setEventAsHandled(rowid);
  emitter.emit(Event.REFRESH_THREADS, null);
};

const formAndSaveEmailLabelsUpdate = async ({
  emailsId,
  labelIdsToAdd,
  labelIdsToRemove
}) => {
  const formattedEmailLabelsToAdd = emailsId.reduce((result, emailId) => {
    const emailLabel = formEmailLabel({ emailId, labels: labelIdsToAdd });
    return [...result, ...emailLabel];
  }, []);

  if (labelIdsToRemove.length) {
    await deleteEmailLabel({ emailsId, labelIds: labelIdsToRemove });
  }
  if (formattedEmailLabelsToAdd.length) {
    await createEmailLabel(formattedEmailLabelsToAdd);
  }
};

const handlePeerEmailDeletedPermanently = async ({ rowid, params }) => {
  const { metadataKeys } = params;
  const emailIds = [];
  for (const metadataKey of metadataKeys) {
    const [email] = await getEmailByKey(metadataKey);
    if (email) {
      emailIds.push(email.id);
      await deleteEmailByKey(metadataKey);
    }
  }
  await setEventAsHandled(rowid);
  emitter.emit(Event.EMAIL_DELETED, emailIds);
};

const handlePeerThreadDeletedPermanently = async ({ rowid, params }) => {
  const { threadIds } = params;
  await deleteEmailsByThreadId(threadIds);
  await setEventAsHandled(rowid);
  emitter.emit(Event.THREADS_DELETED, threadIds);
};

const handlePeerLabelCreated = async ({ rowid, params }) => {
  const { text, color } = params;
  const [label] = await getLabelsByText([text]);
  if (!label) {
    await emitter.emit(Event.LABEL_CREATED, {
      text,
      color: `#${color}`,
      visible: true
    });
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

ipcRenderer.on('update-drafts', (ev, data) => {
  if (data) {
    const labelId = LabelType.draft.id;
    data = { ...data, labelId };
  }
  emitter.emit(Event.REFRESH_THREADS, data);
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

export const sendUpdateThreadLabelsErrorMessage = () => {
  const messageData = {
    ...Messages.error.updateThreadLabels,
    type: MessageType.ERROR
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
};

export const sendRemoveThreadsErrorMessage = () => {
  const messageData = {
    ...Messages.error.removeThreads,
    type: MessageType.ERROR
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
};

export const sendFetchEmalsErrorMessage = () => {
  const messageData = {
    ...Messages.error.fetchEmails,
    type: MessageType.ERROR
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
};

export const addEvent = (eventName, callback) => {
  emitter.addListener(eventName, callback);
};

export const removeEvent = eventName => {
  emitter.removeEvent(eventName);
};

export const Event = {
  NEW_EMAIL: 'new-email',
  REFRESH_THREADS: 'refresh-threads',
  EMAIL_TRACKING_UPDATE: 'email-tracking-update',
  UPDATE_EMAILS: 'update-emails',
  DISPLAY_MESSAGE: 'display-message',
  LABEL_CREATED: 'label-created',
  THREADS_DELETED: 'thread-deleted-permanently',
  EMAIL_DELETED: 'email-deleted-permanently',
  THREADS_UPDATE_READ: 'threads-update-read'
};
