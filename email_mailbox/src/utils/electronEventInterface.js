import ipc from '@criptext/electron-better-ipc/renderer';
import signal from './../libs/signal';
import {
  LabelType,
  myAccount,
  mySettings,
  getNews,
  getDeviceType,
  checkDisableRequests,
  disableEventRequests,
  enableEventRequests
} from './electronInterface';
import {
  createEmail,
  createEmailLabel,
  createFeedItem,
  createLabel,
  deleteEmailByKeys,
  deleteEmailContent,
  deleteEmailLabel,
  deleteEmailsByThreadIdAndLabelId,
  getEmailByKey,
  getEmailByParams,
  getEmailLabelsByEmailId,
  getEmailsByKeys,
  getEmailsByThreadId,
  getContactByEmails,
  getLabelsByParams,
  logoutApp,
  openFilledComposerWindow,
  showNotificationApp,
  sendStartSyncDeviceEvent,
  sendStartLinkDevicesEvent,
  unsendEmail,
  updateAccount,
  updateContactByEmail,
  updateEmail,
  updateEmails,
  updateFilesByEmailId,
  updateUnreadEmailByThreadIds,
  updatePushToken,
  updateDeviceType,
  checkForUpdates,
  changeAccountApp,
  cleanDataLogout,
  startSocket
} from './ipc';
import {
  checkEmailIsTo,
  cleanEmailBody,
  formEmailLabel,
  formFilesFromData,
  formIncomingEmailFromData,
  getRecipientIdFromEmailAddressTag,
  getRecipientsFromData,
  validateEmailStatusToSet,
  parseContactRow
} from './EmailUtils';
import {
  SocketCommand,
  appDomain,
  EmailStatus,
  composerEvents,
  EXTERNAL_RECIPIENT_ID_SERVER
} from './const';
import Messages from './../data/message';
import { MessageType } from './../components/Message';
import { AttachItemStatus } from '../components/AttachItem';
import {
  getShowEmailPreviewStatus,
  getUserGuideStepStatus,
  clearStorage
} from './storage';
import {
  fetchAcknowledgeEvents,
  fetchEvents,
  fetchEventAction
} from './FetchUtils';
import string from './../lang';

const EventEmitter = window.require('events');
const electron = window.require('electron');
const { ipcRenderer, remote } = electron;
const {
  START_NOTIFICATION_SERVICE,
  NOTIFICATION_SERVICE_STARTED,
  TOKEN_UPDATED,
  NOTIFICATION_RECEIVED
} = remote.require('@criptext/electron-push-receiver/src/constants');
const senderNotificationId = '73243261136';
const emitter = new EventEmitter();
let totalEmailsPending = null;
let totalEmailsHandled = 0;

let isGettingEvents = false;
let labelIdsEvent = new Set();
let threadIdsEvent = new Set();
let badgeLabelIdsEvent = new Set();
let labelsEvent = {};
let avatarHasChanged = false;

let newEmailNotificationList = [];

const stopGettingEvents = () => {
  isGettingEvents = false;
  emitter.emit(Event.STOP_LOAD_SYNC, {});
};

const parseAndStoreEventsBatch = async ({ events, hasMoreEvents }) => {
  labelIdsEvent = new Set();
  threadIdsEvent = new Set();
  badgeLabelIdsEvent = new Set();
  labelsEvent = {};
  avatarHasChanged = false;

  const rowIds = [];
  const completedTask = events.reduce((count, event) => {
    if (event.cmd === SocketCommand.NEW_EMAIL) {
      count++;
    }
    return count;
  }, 0);
  totalEmailsHandled = totalEmailsHandled + completedTask;

  for (const event of events) {
    try {
      const {
        avatarChanged,
        rowid,
        labelIds,
        threadIds,
        labels,
        badgeLabelIds
      } = await handleEvent(event);
      rowIds.push(rowid);
      if (threadIds)
        threadIdsEvent = new Set([...threadIdsEvent, ...threadIds]);
      if (labelIds) {
        labelIdsEvent = new Set([...labelIdsEvent, ...labelIds]);
        badgeLabelIdsEvent = new Set([...badgeLabelIdsEvent, ...labelIds]);
      }
      if (badgeLabelIds)
        badgeLabelIdsEvent = new Set([...badgeLabelIdsEvent, ...badgeLabelIds]);
      if (labels) labelsEvent = { ...labelsEvent, ...labels };
      if (avatarChanged) avatarHasChanged = true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      if (
        !(
          error.name === 'PreKeyMessage' || error.name === 'MessageCounterError'
        )
      ) {
        sendFetchEmailsErrorMessage();
      }
    }
  }

  const rowIdsFiltered = rowIds.filter(rowId => !!rowId);
  if (rowIdsFiltered.length || (events.length && !rowIdsFiltered.length)) {
    if (rowIdsFiltered.length) await setEventAsHandled(rowIdsFiltered);

    const labelIds = labelIdsEvent.size ? Array.from(labelIdsEvent) : null;
    const threadIds = threadIdsEvent.size ? Array.from(threadIdsEvent) : null;
    const badgeLabelIds = badgeLabelIdsEvent.size
      ? Array.from(badgeLabelIdsEvent)
      : null;
    const labels = labelsEvent
      ? Object.keys(labelsEvent).length
        ? labelsEvent
        : null
      : null;
    const hasStopLoad = !hasMoreEvents;
    emitter.emit(Event.STORE_LOAD, {
      avatarHasChanged,
      completedTask: totalEmailsHandled,
      labelIds,
      threadIds,
      labels,
      badgeLabelIds,
      hasStopLoad
    });
  }
};

export const getGroupEvents = async ({
  shouldGetMoreEvents,
  showNotification
}) => {
  const isDisabledParsingEvents = checkDisableRequests();
  if (isDisabledParsingEvents) return stopGettingEvents();

  if (isGettingEvents && !shouldGetMoreEvents) return;

  isGettingEvents = true;
  if (totalEmailsPending === null) {
    totalEmailsHandled = 0;
    const res = await fetchEventAction({ cmd: 101, action: 'count' });
    if (!res) {
      stopGettingEvents();
      return;
    }

    const { total } = res;
    if (total) {
      totalEmailsPending = total;
      emitter.emit(Event.UPDATE_LOADING_SYNC, {
        totalTask: total,
        completedTask: 0
      });
    }
  }
  const response = await fetchEvents();
  if (!response) {
    stopGettingEvents();
    return;
  }

  const { events, hasMoreEvents } = response;
  if (!events.length) {
    stopGettingEvents();
    return;
  }

  await parseAndStoreEventsBatch({ events, hasMoreEvents });

  if (!hasMoreEvents) {
    await updateOwnContact();
    if (showNotification) {
      sendNewEmailNotification();
    }
    isGettingEvents = false;
    totalEmailsPending = null;
    return;
  }
  await getGroupEvents({
    shouldGetMoreEvents: hasMoreEvents,
    showNotification
  });
};

export const isGettingEventsGet = () => isGettingEvents;
export const isGettingEventsUpdate = value => {
  isGettingEvents = value;
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
    case SocketCommand.LOW_PREKEYS_AVAILABLE: {
      return handleLowPrekeysAvailable(incomingEvent);
    }
    case SocketCommand.DEVICE_LINK_AUTHORIZATION_REQUEST: {
      return handleLinkDeviceRequest(incomingEvent);
    }
    case SocketCommand.KEYBUNDLE_UPLOADED: {
      return handleKeybundleUploaded(incomingEvent);
    }
    case SocketCommand.DEVICE_REMOVED: {
      return handlePeerRemoveDevice(incomingEvent);
    }
    case SocketCommand.SYNC_DEVICE_REQUEST: {
      return handleSyncDeviceRequest(incomingEvent);
    }
    case SocketCommand.PEER_AVATAR_CHANGED: {
      return handlePeerAvatarChanged(incomingEvent);
    }
    case SocketCommand.PEER_EMAIL_READ_UPDATE: {
      return handlePeerEmailRead(incomingEvent);
    }
    case SocketCommand.PEER_EMAIL_UNSEND: {
      return handlePeerEmailUnsend(incomingEvent);
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
    case SocketCommand.NEW_ANNOUNCEMENT: {
      return handleNewAnnouncementEvent(incomingEvent);
    }
    case SocketCommand.UPDATE_AVAILABLE: {
      return handleNewUpdateAvailable(incomingEvent);
    }
    case SocketCommand.UPDATE_DEVICE_TYPE: {
      return handleUpdateDeviceTypeEvent(incomingEvent);
    }
    default: {
      return { rowid: null };
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
    fileKeys,
    files,
    from,
    inReplyTo,
    replyTo,
    labels,
    messageType,
    metadataKey,
    subject,
    senderDeviceId,
    threadId,
    to,
    toArray,
    messageId,
    external,
    boundary
  } = params;
  if (!metadataKey) return { rowid: null };
  const recipientId =
    external === true
      ? EXTERNAL_RECIPIENT_ID_SERVER
      : getRecipientIdFromEmailAddressTag(from);
  const deviceId =
    external === undefined
      ? typeof messageType === 'number'
        ? senderDeviceId
        : undefined
      : senderDeviceId;
  const [prevEmail] = await getEmailByKey(metadataKey);
  const isSpam = labels
    ? labels.find(label => label === LabelType.spam.text)
    : undefined;
  const InboxLabelId = LabelType.inbox.id;
  const SentLabelId = LabelType.sent.id;
  const SpamLabelId = LabelType.spam.id;
  const isFromMe =
    myAccount.recipientId === getRecipientIdFromEmailAddressTag(from);
  const recipients = getRecipientsFromData({
    to: to || toArray,
    cc: cc || ccArray,
    bcc: bcc || bccArray,
    from
  });
  const isToMe = checkEmailIsTo(recipients);
  let notificationPreview = '';
  const labelIds = [];
  if (!prevEmail) {
    let body = '',
      headers;
    try {
      const { decryptedBody, decryptedHeaders } = await signal.decryptEmail({
        bodyKey: metadataKey,
        recipientId,
        deviceId,
        messageType
      });
      body = cleanEmailBody(decryptedBody);
      headers = decryptedHeaders;
    } catch (e) {
      body = 'Content unencrypted';
    }
    let myFileKeys;
    if (fileKeys) {
      myFileKeys = await Promise.all(
        fileKeys.map(async fileKey => {
          try {
            const decrypted = await signal.decryptFileKey({
              fileKey,
              messageType,
              recipientId,
              deviceId
            });
            const [key, iv] = decrypted.split(':');
            return { key, iv };
          } catch (e) {
            return { key: undefined, iv: undefined };
          }
        })
      );
    } else if (fileKey) {
      try {
        const decrypted = await signal.decryptFileKey({
          fileKey,
          messageType,
          recipientId,
          deviceId
        });
        const [key, iv] = decrypted.split(':');
        myFileKeys = files.map(() => ({ key, iv }));
      } catch (e) {
        myFileKeys = undefined;
      }
    }
    const unread = isFromMe && !isToMe ? false : true;
    let emailThreadId = threadId;
    if (inReplyTo) {
      const emailWithMessageId = await getEmailByParams({
        messageId: inReplyTo
      });
      if (emailWithMessageId) {
        emailThreadId = emailWithMessageId.threadId;
      }
    }

    const data = {
      body,
      date,
      from,
      isFromMe,
      metadataKey,
      deviceId,
      subject,
      threadId: emailThreadId,
      unread,
      messageId,
      replyTo,
      boundary
    };
    const email = await formIncomingEmailFromData(data);
    notificationPreview = email.preview;
    const filesData =
      files && files.length
        ? await formFilesFromData({
            files,
            date,
            fileKeys: myFileKeys,
            emailContent: body
          })
        : null;

    if (isFromMe) {
      labelIds.push(SentLabelId);
      if (isToMe) {
        labelIds.push(InboxLabelId);
      }
    } else {
      labelIds.push(InboxLabelId);
    }
    if (isSpam) {
      labelIds.push(SpamLabelId);
    }
    const emailData = {
      accountId: myAccount.id,
      email,
      labels: labelIds,
      files: filesData,
      recipients,
      body,
      headers
    };
    await createEmail(emailData);
  } else {
    const prevEmailLabels = await getEmailLabelsByEmailId(prevEmail.id);
    const prevLabels = prevEmailLabels.map(item => item.labelId);

    const hasSentLabelId = prevLabels.includes(SentLabelId);
    if (isFromMe && !hasSentLabelId) {
      labelIds.push(SentLabelId);

      const hasInboxLabelId = prevLabels.includes(InboxLabelId);
      if (isToMe && !hasInboxLabelId) {
        labelIds.push(InboxLabelId);
      }
    }
    const hasSpamLabelId = prevLabels.includes(SpamLabelId);
    if (isSpam && !hasSpamLabelId) {
      labelIds.push(SpamLabelId);
    }

    if (labelIds.length) {
      const emailLabel = formEmailLabel({
        emailId: prevEmail.id,
        labels: labelIds
      });
      await createEmailLabel(emailLabel);
    }
    notificationPreview = prevEmail.preview;
  }
  if (isToMe && !isSpam) {
    const parsedContact = parseContactRow(from);
    addEmailToNotificationList({
      senderInfo: parsedContact.name || parsedContact.email,
      emailSubject: subject,
      emailPreview: notificationPreview,
      threadId
    });
  }
  const mailboxIdsToUpdate = isSpam ? [LabelType.spam.id] : labelIds;
  return {
    rowid,
    labelIds: mailboxIdsToUpdate,
    threadIds: threadId ? [threadId] : null
  };
};

const addEmailToNotificationList = ({
  senderInfo,
  emailSubject,
  emailPreview,
  threadId
}) => {
  newEmailNotificationList.push({
    senderInfo,
    emailSubject,
    emailPreview,
    threadId
  });
};

const sendNewEmailNotification = () => {
  if (newEmailNotificationList.length <= 3) {
    newEmailNotificationList.forEach(notificationData => {
      const {
        emailSubject,
        emailPreview,
        senderInfo,
        threadId
      } = notificationData;
      const message = getShowEmailPreviewStatus()
        ? `${emailSubject}\n${emailPreview}`
        : `${emailSubject}`;
      showNotificationApp({ title: senderInfo, message, threadId });
    });
  } else if (newEmailNotificationList.length > 3) {
    const title = 'Criptext';
    const message =
      string.notification.newEmailGroup.prefix +
      newEmailNotificationList.length +
      string.notification.newEmailGroup.sufix;
    showNotificationApp({ title, message, threadId: null });
  }
  newEmailNotificationList = [];
};

const updateOwnContact = async () => {
  const ownEmail = `${myAccount.recipientId}@${appDomain}`;
  const accountName = myAccount.name;
  if (accountName) {
    await updateContactByEmail({ email: ownEmail, name: accountName });
  }
};

const handleEmailTrackingUpdate = async ({ rowid, params }) => {
  const { date, metadataKey, type, from } = params;
  const [email] = await getEmailByKey(metadataKey);
  const isUnsend = type === EmailStatus.UNSEND;
  if (email) {
    const preview = isUnsend ? '' : null;
    const status = validateEmailStatusToSet(email.status, type);
    const unsendDate = isUnsend ? date : null;
    if (status || preview || unsendDate) {
      await updateEmail({
        id: email.id,
        status,
        preview,
        unsendDate
      });
      if (isUnsend) {
        await updateFilesByEmailId({
          emailId: email.id,
          status: AttachItemStatus.UNSENT
        });
        await deleteEmailContent({ metadataKey });
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
    }
  }
  if (!email && isUnsend) return { rowid: null };
  return { rowid, threadIds: email ? [email.threadId] : [] };
};

const handlePeerAvatarChanged = ({ rowid }) => {
  return { rowid, avatarChanged: true };
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
    if (res) {
      return {
        rowid,
        threadIds: [emails[0].threadId],
        badgeLabelIds: [LabelType.inbox.id, LabelType.spam.id]
      };
    }
    return { rowid: null };
  }
  return { rowid };
};

const handlePeerEmailUnsend = async ({ rowid, params }) => {
  const type = EmailStatus.UNSEND;
  const { metadataKey, date } = params;
  const [email] = await getEmailByKey(metadataKey);
  if (email) {
    const status = validateEmailStatusToSet(email.status, type);
    await unsendEmail({
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
  }
  return { rowid, threadIds: email ? [email.threadId] : [] };
};

const handleLinkDeviceRequest = ({ rowid, params }) => {
  sendStartLinkDevicesEvent({ rowid, params });
  return { rowid: null };
};

const handleKeybundleUploaded = ({ rowid }) => {
  return { rowid };
};

const handleSyncDeviceRequest = ({ rowid, params }) => {
  sendStartSyncDeviceEvent({ rowid, params });
  return { rowid: null };
};

const handlePeerRemoveDevice = async ({ rowid }) => {
  return await sendDeviceRemovedEvent(rowid);
};

const handlePeerThreadRead = async ({ rowid, params }) => {
  const { threadIds, unread } = params;
  const res = await updateUnreadEmailByThreadIds({
    threadIds,
    unread: !!unread
  });
  if (res) {
    return {
      rowid,
      threadIds,
      badgeLabelIds: [LabelType.inbox.id, LabelType.spam.id]
    };
  }
  return { rowid };
};

const handlePeerEmailLabelsUpdate = async ({ rowid, params }) => {
  const { metadataKeys, labelsRemoved, labelsAdded } = params;
  const emailsId = [];
  const threadIds = [];
  for (const metadataKey of metadataKeys) {
    const [email] = await getEmailByKey(metadataKey);
    if (email) {
      emailsId.push(email.id);
      threadIds.push(email.threadId);
    }
  }
  if (!emailsId.length) return { rowid: null };
  const labelsToRemove = await getLabelsByParams({ textArray: labelsRemoved });
  const labelIdsToRemove = labelsToRemove.map(label => label.id);
  const labelsToAdd = await getLabelsByParams({ textArray: labelsAdded });
  const labelIdsToAdd = labelsToAdd.map(label => label.id);

  await formAndSaveEmailLabelsUpdate({
    emailsId,
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
  let badgeLabelIds = [];
  if (hasInbox) badgeLabelIds = [...badgeLabelIds, LabelType.inbox.id];
  if (hasSpam) badgeLabelIds = [...badgeLabelIds, LabelType.spam.id];

  return { rowid, threadIds, badgeLabelIds };
};

const handlePeerThreadLabelsUpdate = async ({ rowid, params }) => {
  const { threadIds, labelsRemoved, labelsAdded } = params;
  let allEmailsIds = [];
  for (const threadId of threadIds) {
    const emails = await getEmailsByThreadId(threadId);
    const emailIds = emails.map(email => email.id);
    allEmailsIds = [...allEmailsIds, ...emailIds];
  }
  if (!allEmailsIds.length) return { rowid };

  const labelsToRemove = await getLabelsByParams({ textArray: labelsRemoved });
  const labelIdsToRemove = labelsToRemove.map(label => label.id);
  const labelsToAdd = await getLabelsByParams({ textArray: labelsAdded });
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
  let badgeLabelIds = [];
  if (hasInbox) badgeLabelIds = [...badgeLabelIds, LabelType.inbox.id];
  if (hasSpam) badgeLabelIds = [...badgeLabelIds, LabelType.spam.id];
  return { rowid, threadIds, badgeLabelIds };
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
  const threadIds = [];
  const keys = [];
  for (const metadataKey of metadataKeys) {
    const [email] = await getEmailByKey(metadataKey);
    if (email) {
      keys.push(email.key);
      threadIds.push(email.threadId);
    }
  }
  await deleteEmailByKeys(keys);
  const labelIds = [LabelType.trash.id, LabelType.spam.id];
  return { rowid, threadIds, labelIds };
};

const handlePeerThreadDeletedPermanently = async ({ rowid, params }) => {
  const { threadIds } = params;
  await deleteEmailsByThreadIdAndLabelId({ threadIds });
  const labelIds = [LabelType.trash.id, LabelType.spam.id];
  return { rowid, threadIds, labelIds };
};

const handlePeerLabelCreated = async ({ rowid, params }) => {
  const { text, color, uuid } = params;
  const [label] = await getLabelsByParams({
    textArray: [text]
  });
  if (!label) {
    const [labelId] = await createLabel({ text, color, uuid });
    const labels = {
      [labelId]: {
        id: labelId,
        color,
        text,
        type: 'custom',
        visible: true,
        uuid
      }
    };
    return { rowid, labels };
  }
  return { rowid };
};

const handlePeerUserNameChanged = async ({ rowid, params }) => {
  const { name } = params;
  const { recipientId } = myAccount;
  await updateAccount({ name, recipientId });
  return { rowid };
};

const handlePeerPasswordChanged = () => {
  return sendPasswordChangedEvent();
};

const handlePeerRecoveryEmailChanged = ({ params }) => {
  const { address } = params;
  emitter.emit(Event.RECOVERY_EMAIL_CHANGED, address);
  return { rowId: null };
};

const handlePeerRecoveryEmailConfirmed = () => {
  emitter.emit(Event.RECOVERY_EMAIL_CONFIRMED);
  return { rowId: null };
};

const handleNewAnnouncementEvent = async ({ rowid, params }) => {
  const { code } = params;
  const { title } = await getNews({ code });
  const messageData = {
    ...Messages.news.announcement,
    type: MessageType.ANNOUNCEMENT,
    description: title
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
  return { rowid };
};

const handleNewUpdateAvailable = async ({ rowid }) => {
  const showUpdateDialogs = false;
  await checkForUpdates(showUpdateDialogs);
  return { rowid };
};

const handleUpdateDeviceTypeEvent = async ({ rowid }) => {
  const newDeviceType = getDeviceType();
  const { status } = await updateDeviceType(newDeviceType);
  return status === 200 ? { rowid } : { rowid: null };
};

const handleSendEmailError = ({ rowid }) => {
  return { rowid };
};

const handleLowPrekeysAvailable = async ({ rowid }) => {
  await signal.generateAndInsertMorePreKeys();
  return { rowid };
};

const setEventAsHandled = async eventIds => {
  return await fetchAcknowledgeEvents({ eventIds });
};

/*  Window events: listener
----------------------------- */
export const sendLoadEventsEvent = params => {
  emitter.emit(Event.LOAD_EVENTS, params);
};

ipcRenderer.on('socket-message', async (ev, message) => {
  const isDisabledParsingEvents = checkDisableRequests();
  if (isDisabledParsingEvents) return;

  const eventId = message.cmd;
  if (eventId === 400) {
    sendLoadEventsEvent({ showNotification: true });
  } else {
    await parseAndStoreEventsBatch({ events: [message], hasMoreEvents: false });
  }
});

ipc.answerMain('get-events', () => {
  sendLoadEventsEvent({});
});

ipcRenderer.on('refresh-window-logged-as', (ev, { accountId, recipientId }) => {
  emitter.emit(Event.LOAD_APP, { accountId, recipientId });
});

export const selectAccountAsActive = async ({ accountId, recipientId }) => {
  disableEventRequests();
  await changeAccountApp({ accountId });
  const email = `${recipientId}@${appDomain}`;
  showLoggedAsMessage(email);
  startSocket(myAccount.jwt);
  enableEventRequests();
};

export const showLoggedAsMessage = email => {
  const messageData = {
    ...Messages.success.loggedAs,
    description: Messages.success.loggedAs.description + email,
    type: MessageType.SUCCESS
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
};

ipcRenderer.on('update-drafts', (ev, shouldUpdateBadge) => {
  const labelId = shouldUpdateBadge ? LabelType.draft.id : undefined;
  emitter.emit(Event.REFRESH_THREADS, { labelIds: [labelId] });
});

ipcRenderer.on(
  'composer-email-sent',
  (ev, { type, threadId, hasExternalPassphrase, threadData }) => {
    if (!threadId) return;
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
    switch (type) {
      case 'new-email': {
        emitter.emit(Event.STORE_LOAD, {
          labelIds: [LabelType.sent.id],
          threadIds: [threadId]
        });
        break;
      }
      case 'draft-edited': {
        emitter.emit(Event.STORE_LOAD, {
          labelIds: [LabelType.sent.id, LabelType.draft.id],
          badgeLabelIds: [LabelType.draft.id],
          threadIds: [threadId]
        });
        break;
      }
      case 'reply': {
        const { threadId, newEmailId, oldEmailId } = threadData;
        emitter.emit(Event.UPDATE_THREAD_EMAILS, {
          threadId,
          newEmailId,
          oldEmailId
        });
        break;
      }
      default:
        break;
    }
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
  stopGettingEvents();
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
  return { rowId: null };
};

export const handleDeleteDeviceData = async rowid => {
  return await setTimeout(async () => {
    await deleteAccountData();
    if (rowid) {
      return { rowid };
    }
    return { rowid: null };
  }, 4000);
};

export const deleteAccountData = async () => {
  clearStorage({});
  const nextAccount = await cleanDataLogout({
    recipientId: myAccount.recipientId,
    deleteAll: true
  });
  if (nextAccount) {
    const { id, recipientId } = nextAccount;
    return await selectAccountAsActive({ id, recipientId });
  }
  clearStorage({ deleteAll: true });
  await logoutApp();
};

export const sendChangePasswordSuccessMessage = () => {
  const messageData = {
    ...Messages.success.changePassword,
    type: MessageType.SUCCESS
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
};

export const sendSetReplyToSuccessMessage = () => {
  const messageData = {
    ...Messages.success.setReplyTo,
    type: MessageType.SUCCESS
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
};

export const sendSetReplyToErrorMessage = () => {
  const messageData = {
    ...Messages.error.setReplyTo,
    type: MessageType.ERROR
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

export const sendAccountDeletedEvent = () => {
  emitter.emit(Event.ACCOUNT_DELETED);
};

export const sendAddedAccountsLimitEvent = () => {
  emitter.emit(Event.ADDED_ACCOUNTS_LIMIT);
};

export const checkUserGuideSteps = stepsNames => {
  // eslint-disable-next-line no-extra-boolean-cast
  if (!!mySettings.opened) {
    const pendingSteps = stepsNames.filter(
      stepName => !getUserGuideStepStatus(stepName)
    );
    if (pendingSteps.length) {
      emitter.emit(Event.SHOW_USER_GUIDE_STEP, pendingSteps);
    }
  }
};

export const sendSetSectionTypeEvent = (type, mailboxSelected) => {
  emitter.emit(Event.SET_SECTION_TYPE, type, mailboxSelected);
};

export const sendManualSyncSuccessMessage = () => {
  const messageData = {
    ...Messages.success.manualSync,
    type: MessageType.SUCCESS
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
};

/*  Firebase
----------------------------- */
ipcRenderer.on(NOTIFICATION_SERVICE_STARTED, async (_, token) => {
  await updatePushToken(token);
});

ipcRenderer.on(TOKEN_UPDATED, async (_, token) => {
  await updatePushToken(token);
});

ipcRenderer.on(NOTIFICATION_RECEIVED, () => {
  const isDisabledParsingEvents = checkDisableRequests();
  if (isDisabledParsingEvents) return;

  sendLoadEventsEvent({ showNotification: true });
});

ipcRenderer.send(START_NOTIFICATION_SERVICE, senderNotificationId);

ipcRenderer.on('open-thread-by-notification', (ev, { threadId }) => {
  emitter.emit(Event.OPEN_THREAD, { threadId });
});

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
  ACCOUNT_DELETED: 'account-deleted',
  ADDED_ACCOUNTS_LIMIT: 'added-accounts-limit',
  DEVICE_REMOVED: 'device-removed',
  DISABLE_WINDOW: 'add-window-overlay',
  DISPLAY_MESSAGE: 'display-message',
  ENABLE_WINDOW: 'remove-window-overlay',
  LINK_DEVICE_END: 'link-devices-finished',
  LINK_DEVICE_GETTING_KEYS: 'getting-keys',
  LINK_DEVICE_MAILBOX_UPLOADED: 'mailbox-uploaded-successfully',
  LINK_DEVICE_PREPARING_MAILBOX: 'preparing-mailbox',
  LINK_DEVICE_UPLOADING_MAILBOX: 'uploading-mailbox',
  LOAD_APP: 'load-app',
  LOAD_EVENTS: 'load-events',
  OPEN_THREAD: 'open-thread',
  PASSWORD_CHANGED: 'password-changed',
  RECOVERY_EMAIL_CHANGED: 'recovery-email-changed',
  RECOVERY_EMAIL_CONFIRMED: 'recovery-email-confirmed',
  REFRESH_THREADS: 'refresh-threads',
  SHOW_USER_GUIDE_STEP: 'show-user-guide-step',
  SET_SECTION_TYPE: 'set-section-type',
  STORE_LOAD: 'store-load',
  STOP_LOAD_SYNC: 'stop-load-sync',
  UPDATE_AVAILABLE: 'update-available',
  UPDATE_LOADING_SYNC: 'update-loading-sync',
  UPDATE_THREAD_EMAILS: 'update-thread-emails'
};
