import signal from './../libs/signal';
import {
  acknowledgeEvents,
  cleanDatabase,
  composerEvents,
  createEmail,
  createEmailLabel,
  createFeedItem,
  createLabel,
  deleteEmailByKeys,
  deleteEmailLabel,
  deleteEmailsByThreadIdAndLabelId,
  getEmailByKey,
  getEmailsByKeys,
  getEmailsByThreadId,
  getEmailLabelsByEmailId,
  getEvents,
  getContactByEmails,
  getLabelsByText,
  LabelType,
  logoutApp,
  myAccount,
  setInternetConnectionStatus,
  updateEmail,
  updateEmails,
  updateAccount,
  updateFilesByEmailId,
  updateUnreadEmailByThreadIds
} from './electronInterface';
import {
  checkEmailIsTo,
  formEmailLabel,
  formFilesFromData,
  formIncomingEmailFromData,
  getRecipientIdFromEmailAddressTag,
  validateEmailStatusToSet,
  parseContactRow
} from './EmailUtils';
import { SocketCommand, appDomain, EmailStatus } from './const';
import Messages from './../data/message';
import { MessageType } from './../components/Message';
import { AttachItemStatus } from '../components/AttachItem';
import { openFilledComposerWindow } from './../utils/ipc';
import { getShowEmailPreviewStatus } from './storage';

const eventPriority = {
  NEW_EMAIL: 0,
  THREAD_STATUS: 1,
  EMAIL_STATUS: 2,
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
      } else if (eventId === SocketCommand.PEER_THREAD_READ_UPDATE) {
        return {
          ...result,
          [eventPriority.THREAD_STATUS]: [
            ...result[eventPriority.THREAD_STATUS],
            event
          ]
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
  let rowIds = [];
  for (const key in eventsGroups) {
    if (eventsGroups.hasOwnProperty(key)) {
      const events = eventsGroups[key];
      if (events.length) {
        const managedEvents = events.map(async newEvent => {
          return await handleEvent(newEvent);
        });
        try {
          const res = await Promise.all(managedEvents);
          rowIds = rowIds.concat(res);
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
  const rowIdsFiltered = rowIds.filter(rowId => !!rowId);
  if (rowIdsFiltered.length) {
    await setEventAsHandled(rowIdsFiltered);
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
    toArray,
    messageId
  } = params;
  const { recipientId, isExternal } = getRecipientIdFromEmailAddressTag(from);
  const [prevEmail] = await getEmailByKey(metadataKey);
  const isSpam = labels
    ? labels.find(label => label === LabelType.spam.text)
    : undefined;
  const InboxLabelId = LabelType.inbox.id;
  const SentLabelId = LabelType.sent.id;
  const isToMe = checkEmailIsTo({
    to: to || toArray,
    cc: cc || ccArray,
    bcc: bcc || bccArray,
    type: 'to'
  });
  const isFromMe = checkEmailIsTo({ from, type: 'from' });
  let eventParams = {};

  let notificationPreview = '';
  if (!prevEmail) {
    let body = '';
    try {
      body = await signal.decryptEmail({
        bodyKey: metadataKey,
        recipientId,
        deviceId: senderDeviceId,
        messageType
      });
    } catch (e) {
      body = 'Content unencrypted';
    }

    let fileKeyParams;
    if (fileKey) {
      try {
        const decrypted = await signal.decryptFileKey({
          fileKey,
          messageType,
          recipientId,
          deviceId: senderDeviceId
        });
        const [key, iv] = decrypted.split(':');
        fileKeyParams = { key, iv };
      } catch (e) {
        fileKeyParams = undefined;
      }
    }
    const unread = isFromMe && !isToMe ? false : true;
    const data = {
      bcc: bcc || bccArray,
      body,
      cc: cc || ccArray,
      date,
      from,
      isEmailApp: !!messageType,
      isFromMe,
      metadataKey,
      deviceId: senderDeviceId,
      subject,
      to: to || toArray,
      threadId,
      unread,
      messageId
    };
    const { email, recipients } = await formIncomingEmailFromData(
      data,
      isExternal
    );
    notificationPreview = email.preview;
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
    notificationPreview = prevEmail.preview;
  }
  if (isToMe) {
    const parsedContact = parseContactRow(from);
    const message = getShowEmailPreviewStatus()
      ? `${subject}\n${notificationPreview}`
      : `${subject}`;
    ipcRenderer.send('show-notification', {
      title: parsedContact.name || parsedContact.email,
      message
    });
  }
  return rowid;
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
    if (status || content || preview || unsendDate) {
      await updateEmail({
        key: String(metadataKey),
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
      const isOpened = type === EmailStatus.READ;
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
  }
  return rowid;
};

const handlePeerEmailUnsend = async ({ rowid, params }) => {
  const type = EmailStatus.UNSEND;
  const { metadataKey, date } = params;
  const [email] = await getEmailByKey(metadataKey);
  if (email) {
    const status = validateEmailStatusToSet(email.status, type);
    await updateEmail({
      key: String(metadataKey),
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
  return rowid;
};

const handleLinkDeviceRequest = ({ rowid, params }) => {
  ipcRenderer.send('start-link-devices-event', { rowid, params });
};

const handlePeerRemoveDevice = async ({ rowid }) => {
  return await sendDeviceRemovedEvent(rowid);
};

const handlePeerEmailRead = async ({ rowid, params }) => {
  const { metadataKeys, unread } = params;
  const emails = await getEmailsByKeys(metadataKeys);
  if (emails.length) {
    const emailKeys = emails.map(email => email.key);
    const res = await updateEmails({
      keys: emailKeys,
      unread: !!unread
    });
    emitter.emit(Event.REFRESH_THREADS, { labelIds: [LabelType.inbox.id] });
    if (res) {
      return rowid;
    }
    return null;
  }
  return null;
};

const handlePeerThreadRead = async ({ rowid, params }) => {
  const { threadIds, unread } = params;
  const res = await updateUnreadEmailByThreadIds(threadIds, !!unread);
  emitter.emit(Event.THREADS_UPDATE_READ, threadIds, !!unread);
  if (res) {
    return rowid;
  }
  return null;
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
  return rowid;
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

  const hasInbox =
    labelIdsToAdd.includes(LabelType.inbox.id) ||
    labelIdsToRemove.includes(LabelType.inbox.id) ||
    labelIdsToAdd.includes(LabelType.trash.id);
  const hasSpam =
    labelIdsToAdd.includes(LabelType.spam.id) ||
    labelIdsToRemove.includes(LabelType.spam.id);
  let labelIds = [];
  if (hasInbox) labelIds = [...labelIds, LabelType.inbox.id];
  if (hasSpam) labelIds = [...labelIds, LabelType.spam.id];
  if (labelIds.length) emitter.emit(Event.REFRESH_THREADS, { labelIds });
  return rowid;
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
  emitter.emit(Event.EMAIL_DELETED, emailIds);
  return rowid;
};

const handlePeerThreadDeletedPermanently = async ({ rowid, params }) => {
  const { threadIds } = params;
  const wereDeleted = await deleteEmailsByThreadIdAndLabelId(threadIds);
  if (wereDeleted) {
    emitter.emit(Event.THREADS_DELETED, threadIds);
  }
  return rowid;
};

const handlePeerLabelCreated = async ({ rowid, params }) => {
  const { text, color } = params;
  const [label] = await getLabelsByText([text]);
  if (!label) {
    const [labelId] = await createLabel({ text, color });
    const labels = {
      [labelId]: {
        id: labelId,
        color,
        text,
        type: 'custom',
        visible: true
      }
    };
    await emitter.emit(Event.LABEL_CREATED, labels);
  }
  return rowid;
};

const handlePeerUserNameChanged = async ({ rowid, params }) => {
  const { name } = params;
  const { recipientId } = myAccount;
  await updateAccount({ name, recipientId });
  return rowid;
};

const handlePeerPasswordChanged = () => {
  return sendPasswordChangedEvent();
};

const handlePeerRecoveryEmailChanged = ({ params }) => {
  const { address } = params;
  emitter.emit(Event.RECOVERY_EMAIL_CHANGED, address);
};

const handlePeerRecoveryEmailConfirmed = () => {
  emitter.emit(Event.RECOVERY_EMAIL_CONFIRMED);
};

const handleSendEmailError = ({ rowid }) => {
  return rowid;
};

const setEventAsHandled = async eventIds => {
  return await acknowledgeEvents(eventIds);
};

/* Window events: listener
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

ipcRenderer.on(
  'display-message-email-sent',
  (ev, { threadId, hasExternalPassphrase }) => {
    const messageData = hasExternalPassphrase
      ? {
          ...Messages.success.rememberSharePassphrase,
          type: MessageType.SUCCESS
        }
      : {
          ...Messages.success.emailSent,
          type: MessageType.SUCCESS,
          params: { threadId }
        };
    emitter.emit(Event.DISPLAY_MESSAGE, messageData);
  }
);

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
    ...Messages.error.emailSent,
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

ipcRenderer.on('disable-window-link-devices', () => {
  emitter.emit(Event.DISABLE_WINDOW);
});

ipcRenderer.on('enable-window-link-devices', () => {
  emitter.emit(Event.ENABLE_WINDOW);
});

ipcRenderer.on('update-available', () => {
  emitter.emit(Event.UPDATE_AVAILABLE, { value: true });
});

/* Window events: handle */
ipcRenderer.on('check-network-status', () => {
  const isOnline = window.navigator.onLine;
  setInternetConnectionStatus(isOnline);
  if (isOnline) {
    processPendingEvents();
  }
});

export const processPendingEvents = () => {
  setTimeout(() => {
    ipcRenderer.send('process-pending-events');
  }, 1000);
};

ipcRenderer.on(
  'open-mailto-in-composer',
  (ev, { subject, content, emailAddress }) => {
    const disabledSendButtonStatus = 1;
    const enabledSendButtonStatus = 2;
    openFilledComposerWindow({
      type: composerEvents.NEW_WITH_DATA,
      data: {
        email: { subject, content },
        recipients: { to: emailAddress },
        status:
          subject && content
            ? enabledSendButtonStatus
            : disabledSendButtonStatus
      }
    });
  }
);

ipcRenderer.on('network-connection-established', () => {
  const messageData = {
    ...Messages.establish.internet,
    type: MessageType.ESTABLISH
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
});

ipcRenderer.on('lost-network-connection', () => {
  const messageData = {
    ...Messages.error.network,
    type: MessageType.ERROR
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
});

/* Window events
  ----------------------------- */
export const sendOpenEventErrorMessage = () => {
  const messageData = {
    ...Messages.error.sendOpenEvent,
    type: MessageType.ERROR
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
};

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

export const sendUnsendEmailErrorMessage = numberError => {
  const messageData = {
    ...Messages.error.unsendEmail,
    description: `${Messages.error.unsendEmail.description} ${numberError}`,
    type: MessageType.ERROR
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
};

export const sendUnsendEmailExpiredErrorMessage = () => {
  const messageData = {
    ...Messages.error.unsendEmailExpired,
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

export const sendResetPasswordSendLinkSuccessMessage = () => {
  const messageData = {
    ...Messages.success.resetPasswordSendLink,
    type: MessageType.SUCCESS
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
};

export const sendResetPasswordSendLinkErrorMessage = () => {
  const messageData = {
    ...Messages.error.resetPasswordSendLink,
    type: MessageType.ERROR
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
};

export const sendDeviceRemovedEvent = async rowid => {
  emitter.emit(Event.DEVICE_REMOVED, null);
  return await handleDeleteDeviceData(rowid);
};

export const sendPasswordChangedEvent = () => {
  emitter.emit(Event.PASSWORD_CHANGED, null);
};

export const handleDeleteDeviceData = async rowid => {
  return await setTimeout(async () => {
    await deleteAllDeviceData();
    if (rowid) {
      return rowid;
    }
    return null;
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

export const sendTwoFactorAuthenticationTurnedOffMessage = () => {
  const messageData = {
    ...Messages.success.twoFactorAuthTurnOff,
    type: MessageType.SUCCESS
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
};

export const addEvent = (eventName, callback) => {
  emitter.addListener(eventName, callback);
};

export const removeEvent = (eventName, callback) => {
  emitter.removeListener(eventName, callback);
};

export const sendMailboxEvent = (eventName, eventData) => {
  emitter.emit(eventName, eventData);
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
  RECOVERY_EMAIL_CONFIRMED: 'recovery-email-confirmed',
  LINK_DEVICE_PREPARING_MAILBOX: 'preparing-mailbox',
  LINK_DEVICE_GETTING_KEYS: 'getting-keys',
  LINK_DEVICE_UPLOADING_MAILBOX: 'uploading-mailbox',
  LINK_DEVICE_MAILBOX_UPLOADED: 'mailbox-uploaded-successfully',
  LINK_DEVICE_END: 'link-devices-finished',
  DISABLE_WINDOW: 'add-window-overlay',
  ENABLE_WINDOW: 'remove-window-overlay'
};
