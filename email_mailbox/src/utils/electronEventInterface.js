import signal from './../libs/signal';
import {
  acknowledgeEvents,
  createEmail,
  createEmailLabel,
  createLabel,
  getEmailByKey,
  getEmailsByKeys,
  getEmailLabelsByEmailId,
  getEvents,
  LabelType,
  getContactByEmails,
  createFeedItem,
  myAccount,
  updateEmail,
  updateEmails,
  getLabelsByText,
  updateAccount,
  updateFilesByEmailId,
  deleteEmailsByThreadIdAndLabelId,
  deleteEmailByKeys,
  updateUnreadEmailByThreadIds,
  getEmailsByThreadId,
  deleteEmailLabel,
  cleanDatabase,
  logoutApp
} from './electronInterface';
import { EmailUtils } from './electronUtilsInterface';
import {
  formEmailLabel,
  formFilesFromData,
  validateEmailStatusToSet
} from './EmailUtils';
import { SocketCommand, appDomain, EmailStatus, deviceTypes } from './const';
import Messages from './../data/message';
import { MessageType } from './../components/Message';
import { AttachItemStatus } from '../components/AttachItem';

const eventPriority = {
  NEW_EMAIL: 0,
  EMAIL_STATUS: 1,
  THREAD_STATUS: 2,
  EMAIL_LABELS: 3,
  THREAD_LABELS: 4,
  EMAIL_DELETE: 5,
  THREAD_DELETE: 6,
  OTHERS: 7
};
const EventEmitter = window.require('events');
const electron = window.require('electron');
const { ipcRenderer } = electron;
const emitter = new EventEmitter();
let isGettingEvents = false;

export const getGroupEvents = async () => {
  if (isGettingEvents) return;
  isGettingEvents = true;
  const receivedEvents = await getEvents();
  const eventsGroups = receivedEvents.reduce(
    (result, event) => {
      const eventId = event.cmd;
      if (eventId === SocketCommand.NEW_EMAIL) {
        return {
          ...result,
          [eventPriority.NEW_EMAIL]: [...result[eventPriority.NEW_EMAIL], event]
        };
      } else if (
        eventId === SocketCommand.EMAIL_TRACKING_UPDATE ||
        eventId === SocketCommand.PEER_EMAIL_READ_UPDATE ||
        eventId === SocketCommand.PEER_EMAIL_UNSEND
      ) {
        return {
          ...result,
          [eventPriority.EMAIL_STATUS]: [
            ...result[eventPriority.EMAIL_STATUS],
            event
          ]
        };
      } else if (eventId === SocketCommand.PEER_THREAD_READ_UPDATE) {
        return {
          ...result,
          [eventPriority.THREAD_STATUS]: [
            ...result[eventPriority.THREAD_STATUS],
            event
          ]
        };
      } else if (eventId === SocketCommand.PEER_EMAIL_LABELS_UPDATE) {
        return {
          ...result,
          [eventPriority.EMAIL_LABELS]: [
            ...result[eventPriority.EMAIL_LABELS],
            event
          ]
        };
      } else if (eventId === SocketCommand.PEER_THREAD_LABELS_UPDATE) {
        return {
          ...result,
          [eventPriority.THREAD_LABELS]: [
            ...result[eventPriority.THREAD_LABELS],
            event
          ]
        };
      } else if (eventId === SocketCommand.PEER_EMAIL_DELETED_PERMANENTLY) {
        return {
          ...result,
          [eventPriority.EMAIL_DELETE]: [
            ...result[eventPriority.EMAIL_DELETE],
            event
          ]
        };
      } else if (eventId === SocketCommand.PEER_THREAD_DELETED_PERMANENTLY) {
        return {
          ...result,
          [eventPriority.THREAD_DELETE]: [
            ...result[eventPriority.THREAD_DELETE],
            event
          ]
        };
      }
      return {
        ...result,
        [eventPriority.OTHERS]: [...result[eventPriority.OTHERS], event]
      };
    },
    {
      [eventPriority.NEW_EMAIL]: [],
      [eventPriority.EMAIL_STATUS]: [],
      [eventPriority.THREAD_STATUS]: [],
      [eventPriority.EMAIL_LABELS]: [],
      [eventPriority.THREAD_LABELS]: [],
      [eventPriority.EMAIL_DELETE]: [],
      [eventPriority.THREAD_DELETE]: [],
      [eventPriority.OTHERS]: []
    }
  );
  isGettingEvents = !(await processEvent(eventsGroups));
};

const processEvent = async eventsGroups => {
  for (const key in eventsGroups) {
    if (eventsGroups.hasOwnProperty(key)) {
      const events = eventsGroups[key];
      if (events.length) {
        const managedEvents = events.map(async newEvent => {
          return await handleEvent(newEvent);
        });
        try {
          await Promise.all(managedEvents);
        } catch (e) {
          if (
            !(e.name === 'PreKeyMessage' || e.name === 'MessageCounterError')
          ) {
            sendFetchEmailsErrorMessage();
          }
        }
      }
    }
  }
  return true;
};

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
    case SocketCommand.DEVICE_LINK_AUTHORIZATION_REQUEST: {
      return handleLinkDeviceRequest(incomingEvent);
    }
    case SocketCommand.DEVICE_REMOVED: {
      return handlePeerRemoveDevice(incomingEvent);
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
    case SocketCommand.PEER_PASSWORD_CHANGED: {
      return handlePeerPasswordChanged();
    }
    case SocketCommand.PEER_RECOVERY_EMAIL_CHANGED: {
      return handlePeerRecoveryEmailChanged(incomingEvent);
    }
    case SocketCommand.PEER_RECOVERY_EMAIL_CONFIRMED: {
      return handlePeerRecoveryEmailConfirmed();
    }
    default: {
      return;
    }
  }
};

const handleNewMessageEvent = async ({ rowid, params }) => {
  const {
    bcc,
    bccArray,
    cc,
    ccArray,
    date,
    fileKey,
    files,
    from,
    labels,
    messageType,
    metadataKey,
    subject,
    senderDeviceId,
    threadId,
    to,
    toArray
  } = params;
  const {
    recipientId,
    isExternal
  } = EmailUtils.getRecipientIdFromEmailAddressTag(from);
  const [prevEmail] = await getEmailByKey(metadataKey);
  const isSpam = labels
    ? labels.find(label => label === LabelType.spam.text)
    : undefined;
  const InboxLabelId = LabelType.inbox.id;
  const SentLabelId = LabelType.sent.id;
  const isToMe = EmailUtils.checkEmailIsTo({ to, cc, bcc, type: 'to' });
  const isFromMe = EmailUtils.checkEmailIsTo({ from, type: 'from' });
  let eventParams = {};

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
      bccArray,
      body,
      cc,
      ccArray,
      date,
      from,
      isToMe,
      metadataKey,
      deviceId: senderDeviceId,
      subject,
      to,
      toArray,
      threadId,
      unread
    };
    const { email, recipients } = await EmailUtils.formIncomingEmailFromData(
      data,
      isExternal
    );
    const filesData =
      files && files.length
        ? await formFilesFromData({
            files,
            date
          })
        : null;

    const labels = isSpam ? [LabelType.spam.id] : [];
    if (isToMe) {
      labels.push(InboxLabelId);
    }
    if (isFromMe) {
      labels.push(SentLabelId);
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

    const hasInboxLabelId = prevLabels.includes(InboxLabelId);
    if (isToMe && !hasInboxLabelId) {
      labels.push(InboxLabelId);
    }

    const hasSentLabelId = prevLabels.includes(SentLabelId);
    if (isFromMe && !hasSentLabelId) {
      labels.push(SentLabelId);
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
  const { date, metadataKey, type, from } = params;
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
    const isFromMe = from === myAccount.recipientId;
    const isOpened = type === EmailStatus.OPENED;
    if (!isFromMe && isOpened) {
      const contactEmail = `${from}@${appDomain}`;
      const [contact] = await getContactByEmails([contactEmail]);
      const feedItemParams = {
        date,
        type,
        emailId: email.id,
        contactId: contact.id
      };
      await createFeedItem([feedItemParams]);
    }
    const eventParams = {
      threadId: email.threadId,
      emailId: email.id,
      status: type,
      date
    };
    emitter.emit(Event.EMAIL_TRACKING_UPDATE, eventParams);
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
    const eventParams = {
      threadId: email.threadId,
      emailId: email.id,
      status: type,
      date
    };
    emitter.emit(Event.EMAIL_TRACKING_UPDATE, eventParams);
  }
  await setEventAsHandled(rowid);
};

const handleLinkDeviceRequest = async ({ rowid, params }) => {
  const deviceName = params.newDeviceInfo.deviceFriendlyName;
  const deviceType =
    params.newDeviceInfo.deviceType === deviceTypes.PC ? 'pc' : 'mobile';
  const messageContent = {
    ...Messages.question.newDevice,
    ask: `${Messages.question.newDevice.ask} ${deviceName} (${deviceType})?`
  };
  const eventData = {
    ...messageContent,
    type: MessageType.QUESTION,
    params: params.newDeviceInfo
  };
  emitter.emit(Event.DISPLAY_MESSAGE, eventData);
  await setEventAsHandled(rowid);
};

const handlePeerRemoveDevice = ({ rowid }) => {
  sendDeviceRemovedEvent(rowid);
};

const handlePeerEmailRead = async ({ rowid, params }) => {
  const { metadataKeys, unread } = params;
  const emails = await getEmailsByKeys(metadataKeys);
  const emailKeys = emails.map(email => email.key);
  const res = await updateEmails({
    keys: emailKeys,
    unread: !!unread
  });
  emitter.emit(Event.REFRESH_THREADS, { labelIds: [LabelType.inbox.id] });
  if (res) {
    await setEventAsHandled(rowid);
  }
};

const handlePeerThreadRead = async ({ rowid, params }) => {
  const { threadIds, unread } = params;
  const res = await updateUnreadEmailByThreadIds(threadIds, !!unread);
  if (res) {
    await setEventAsHandled(rowid);
  }
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
  const hasInbox =
    labelIdsToAdd.includes(LabelType.inbox.id) ||
    labelIdsToRemove.includes(LabelType.inbox.id);
  const hasSpam =
    labelIdsToAdd.includes(LabelType.spam.id) ||
    labelIdsToRemove.includes(LabelType.spam.id);
  let labelIds = [];
  if (hasInbox) labelIds = [...labelIds, LabelType.inbox.id];
  if (hasSpam) labelIds = [...labelIds, LabelType.spam.id];
  emitter.emit(Event.REFRESH_THREADS, { labelIds });
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
  const keys = [];
  for (const metadataKey of metadataKeys) {
    const [email] = await getEmailByKey(metadataKey);
    if (email) {
      emailIds.push(email.id);
      keys.push(email.key);
    }
  }
  await deleteEmailByKeys(keys);
  await setEventAsHandled(rowid);
  emitter.emit(Event.EMAIL_DELETED, emailIds);
};

const handlePeerThreadDeletedPermanently = async ({ rowid, params }) => {
  const { threadIds } = params;
  const wereDeleted = await deleteEmailsByThreadIdAndLabelId(threadIds);
  await setEventAsHandled(rowid);
  if (wereDeleted) {
    emitter.emit(Event.THREADS_DELETED, threadIds);
  }
};

const handlePeerLabelCreated = async ({ rowid, params }) => {
  const { text, color } = params;
  const [label] = await getLabelsByText([text]);
  if (!label) {
    const [labelId] = await createLabel({ text, color: `#${color}` });
    const labels = {
      [labelId]: {
        id: labelId,
        color: `#${color}`,
        text,
        type: 'custom',
        visible: true
      }
    };
    await emitter.emit(Event.LABEL_CREATED, labels);
  }
  await setEventAsHandled(rowid);
};

const handlePeerUserNameChanged = async ({ rowid, params }) => {
  const { name } = params;
  const { recipientId } = myAccount;
  await updateAccount({ name, recipientId });
  await setEventAsHandled(rowid);
};

const handlePeerPasswordChanged = () => {
  return sendPasswordChangedEvent();
};

const handlePeerRecoveryEmailChanged = async ({ params }) => {
  const { recipientId } = myAccount;
  const { address } = params;
  const dbRes = await updateAccount({
    recoveryEmail: address,
    recoveryEmailConfirmed: false,
    recipientId
  });
  if (dbRes) {
    emitter.emit(Event.RECOVERY_EMAIL_CHANGED, address);
  }
};

const handlePeerRecoveryEmailConfirmed = async () => {
  const { recipientId } = myAccount;
  const dbRes = await updateAccount({
    recoveryEmailConfirmed: true,
    recipientId
  });
  if (dbRes) {
    emitter.emit(Event.RECOVERY_EMAIL_CONFIRMED);
  }
};

const handleSendEmailError = async ({ rowid }) => {
  await setEventAsHandled(rowid);
};

const setEventAsHandled = async eventId => {
  return await acknowledgeEvents([eventId]);
};

/* Window events
  ----------------------------- */
ipcRenderer.on('socket-message', async (ev, message) => {
  const eventId = message.cmd;
  if (eventId === 400) {
    await getGroupEvents();
  } else {
    handleEvent(message);
  }
});

ipcRenderer.on('get-events', () => {
  emitter.emit(Event.LOAD_EVENTS, {});
});

ipcRenderer.on('update-drafts', (ev, shouldUpdateBadge) => {
  const labelId = shouldUpdateBadge ? LabelType.draft.id : undefined;
  emitter.emit(Event.REFRESH_THREADS, { labelIds: [labelId] });
});

ipcRenderer.on('display-message-email-sent', (ev, { threadId }) => {
  const messageData = {
    ...Messages.success.emailSent,
    type: MessageType.SUCCESS,
    params: { threadId }
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

ipcRenderer.on('device-removed', async () => {
  await sendDeviceRemovedEvent();
});

ipcRenderer.on('password-changed', () => {
  return sendPasswordChangedEvent();
});

export const sendUpdateLabelsErrorMessage = () => {
  const messageData = {
    ...Messages.error.updateLabels,
    type: MessageType.ERROR
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
};

export const sendUpdateThreadLabelsErrorMessage = () => {
  const messageData = {
    ...Messages.error.updateThreadLabels,
    type: MessageType.ERROR
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
};

export const sendUpdateUnreadThreadsErrorMessage = () => {
  const messageData = {
    ...Messages.error.updateUnreadThreads,
    type: MessageType.ERROR
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
};

export const sendOpenEventErrorMessage = () => {
  const messageData = {
    ...Messages.error.sendOpenEvent,
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

export const sendFetchEmailsErrorMessage = () => {
  const messageData = {
    ...Messages.error.fetchEmails,
    type: MessageType.ERROR
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
};

export const sendRemoveDeviceErrorMessage = () => {
  const messageData = {
    ...Messages.error.removeDevice,
    type: MessageType.ERROR
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
};

export const sendRemoveDeviceSuccessMessage = () => {
  const messageData = {
    ...Messages.success.removeDevice,
    type: MessageType.SUCCESS
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
};

export const sendRecoveryEmailChangedErrorMessage = () => {
  const messageData = {
    ...Messages.error.recoveryEmailChanged,
    type: MessageType.ERROR
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
};

export const sendRecoveryEmailChangedSuccessMessage = () => {
  const messageData = {
    ...Messages.success.recoveryEmailChanged,
    type: MessageType.SUCCESS
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
};

export const sendRecoveryEmailLinkConfirmationErrorMessage = () => {
  const messageData = {
    ...Messages.error.recoveryEmailLinkConfirmation,
    type: MessageType.ERROR
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
};

export const sendRecoveryEmailLinkConfirmationSuccessMessage = () => {
  const messageData = {
    ...Messages.success.recoveryEmailLinkConfirmation,
    type: MessageType.SUCCESS
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
};

export const sendDeviceRemovedEvent = async rowid => {
  emitter.emit(Event.DEVICE_REMOVED, null);
  await handleDeleteDeviceData(rowid);
};

export const sendPasswordChangedEvent = () => {
  emitter.emit(Event.PASSWORD_CHANGED, null);
};

export const handleDeleteDeviceData = async rowid => {
  return await setTimeout(async () => {
    if (rowid) {
      await setEventAsHandled(rowid);
    }
    await deleteAllDeviceData();
  }, 4000);
};

export const deleteAllDeviceData = async () => {
  await cleanDatabase();
  await logoutApp();
};

export const sendChangePasswordSuccessMessage = () => {
  const messageData = {
    ...Messages.success.changePassword,
    type: MessageType.SUCCESS
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
};

export const sendChangePasswordErrorMessage = () => {
  const messageData = {
    ...Messages.error.changePassword,
    type: MessageType.ERROR
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
};

export const addEvent = (eventName, callback) => {
  emitter.addListener(eventName, callback);
};

export const removeEvent = (eventName, callback) => {
  emitter.removeListener(eventName, callback);
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
  THREADS_UPDATE_READ: 'threads-update-read',
  DEVICE_REMOVED: 'device-removed',
  PASSWORD_CHANGED: 'password-changed',
  RECOVERY_EMAIL_CHANGED: 'recovery-email-changed',
  RECOVERY_EMAIL_CONFIRMED: 'recovery-email-confirmed'
};
