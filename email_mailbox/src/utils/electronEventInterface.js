import ipc from '@criptext/electron-better-ipc/renderer';
import signal from './../libs/signal';
import {
  LabelType,
  myAccount,
  mySettings,
  getNews,
  getDeviceType,
  getBackupStatus,
  getTokenByRecipientId
} from './electronInterface';
import {
  changeAccountApp,
  changeEmailBlockedAccount,
  checkForUpdates,
  cleanDatabase,
  cleanDataLogout,
  createAlias,
  createCustomDomain,
  createEmail,
  createEmailLabel,
  createFeedItem,
  createLabel,
  deleteAliases,
  deleteCustomDomainByName,
  deleteEmailByKeys,
  deleteEmailContent,
  deleteEmailLabel,
  deleteEmailsByThreadIdAndLabelId,
  deleteLabelById,
  focusMailbox,
  getAlias,
  getCustomDomainByParams,
  getEmailByKey,
  getEmailByParams,
  getEmailLabelsByEmailId,
  getEmailsByArrayParam,
  getEmailsIdsByThreadIds,
  getContactByEmails,
  getLabelsByText,
  getLabelByUuid,
  logoutApp,
  openFilledComposerWindow,
  reportContentUnencrypted,
  reportContentUnencryptedBob,
  restartConnection,
  sendEndLinkDevicesEvent,
  sendEndSyncDevicesEvent,
  showNotificationApp,
  sendStartSyncDeviceEvent,
  sendStartLinkDevicesEvent,
  unsendEmail,
  updateAccount,
  updateAlias,
  updateContactByEmail,
  updateContactSpamScore,
  updateEmail,
  updateEmails,
  updateFilesByEmailId,
  updateLabel as updateLabelDB,
  updateUnreadEmailByThreadIds,
  updatePushToken,
  updateDeviceType,
  initAutoBackupMonitor,
  updateAccountDefaultAddress,
  createOrUpdateContact
} from './ipc';
import {
  checkEmailIsTo,
  checkEmailsToAllAccounts,
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
  EXTERNAL_RECIPIENT_ID_SERVER,
  NOTIFICATION_ACTIONS,
  SEND_BUTTON_STATUS
} from './const';
import Messages from './../data/message';
import { MessageType } from './../components/Message';
import { AttachItemStatus } from '../components/AttachItem';
import {
  getShowEmailPreviewStatus,
  getUserGuideStepStatus,
  setShowEmailPreviewStatus
} from './storage';
import {
  fetchAcknowledgeEvents,
  fetchEvents,
  fetchEventAction,
  fetchGetSingleEvent
} from './FetchUtils';
import string from './../lang';
import { processPendingEvents } from './ipc';
import { version as appVersion } from '../../package.json';
import semver from 'semver';

const EventEmitter = window.require('events');
const electron = window.require('electron');
const { ipcRenderer, remote } = electron;
const {
  START_NOTIFICATION_SERVICE,
  NOTIFICATION_RECEIVED,
  NOTIFICATION_SERVICE_STARTED,
  TOKEN_UPDATED
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
let removedLabels = [];
let updatedLabels = [];
let feedItemHasAdded = false;
let profileHasChanged = false;

let newEmailNotificationList = [];
let deleteDataIntervalId = null;

const stopGettingEvents = () => {
  isGettingEvents = false;
  emitter.emit(Event.STOP_LOAD_SYNC, {});
  if (!getBackupStatus()) {
    initAutoBackupMonitor();
  }
  processPendingEvents({});
};

const getAccountInfo = (recipientId, domain) => {
  if (!recipientId || !domain) {
    return {
      accountId: myAccount.id,
      accountRecipientId: myAccount.recipientId,
      accountEmail: myAccount.email,
      optionalToken: myAccount.jwt
    };
  }
  const accountRecipientId =
    domain === appDomain ? recipientId : `${recipientId}@${domain}`;

  const account =
    accountRecipientId === myAccount.recipientId
      ? myAccount
      : myAccount.loggedAccounts.find(
          account => account.recipientId === accountRecipientId
        );

  const accountEmail = account.recipientId.includes('@')
    ? account.recipientId
    : `${account.recipientId}@${appDomain}`;
  return {
    accountId: account.id,
    accountRecipientId,
    accountEmail,
    optionalToken: account.jwt
  };
};

const parseAndStoreEventsBatch = async ({
  events,
  hasMoreEvents,
  recipientId,
  domain
}) => {
  labelIdsEvent = new Set();
  threadIdsEvent = new Set();
  badgeLabelIdsEvent = new Set();
  labelsEvent = {};
  removedLabels = [];
  updatedLabels = [];
  profileHasChanged = false;

  const rowIds = [];
  const completedTask = events.reduce((count, event) => {
    if (event.cmd === SocketCommand.NEW_EMAIL) {
      count++;
    }
    return count;
  }, 0);
  totalEmailsHandled = totalEmailsHandled + completedTask;

  const {
    accountId,
    accountRecipientId,
    accountEmail,
    optionalToken
  } = getAccountInfo(recipientId, domain);

  for (const event of events) {
    try {
      const {
        profileChanged,
        feedItemAdded,
        rowid,
        labelIds,
        threadIds,
        labels,
        badgeLabelIds,
        removedLabel,
        updatedLabel
      } = await handleEvent({
        incomingEvent: event,
        accountId,
        accountRecipientId,
        accountEmail,
        optionalToken
      });
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
      if (removedLabel) removedLabels = [...removedLabels, removedLabel];
      if (updatedLabel) updatedLabels = [...updatedLabels, updatedLabel];
      if (profileChanged) profileHasChanged = true;
      if (feedItemAdded) feedItemHasAdded = true;
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
    if (rowIdsFiltered.length)
      await setEventAsHandled(rowIdsFiltered, optionalToken);

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
      profileHasChanged,
      completedTask: totalEmailsHandled,
      feedItemHasAdded,
      labelIds,
      threadIds,
      labels,
      badgeLabelIds,
      hasStopLoad,
      removedLabels,
      updatedLabels
    });
  }

  return {
    accountId,
    accountRecipientId
  };
};

const parseAndDispatchEvent = async (event, recipientId, domain) => {
  const {
    accountId,
    accountRecipientId,
    accountEmail,
    optionalToken
  } = getAccountInfo(recipientId, domain);
  try {
    const {
      feedItemAdded,
      rowid,
      labelIds,
      threadIds,
      labels,
      removedLabel,
      updatedLabel
    } = await handleEvent({
      incomingEvent: event,
      accountId,
      accountRecipientId,
      accountEmail,
      optionalToken
    });
    if (rowid) await setEventAsHandled([rowid]);
    emitter.emit(Event.STORE_LOAD, {
      feedItemHasAdded: feedItemAdded,
      labelIds,
      threadIds,
      labels,
      badgeLabelIds: labelIds,
      removedLabels: removedLabel ? [removedLabel] : null,
      updatedLabels: updatedLabel ? [updatedLabel] : null
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    sendFetchEmailsErrorMessage();
  }
  return {
    accountId,
    accountRecipientId
  };
};

export const getGroupEvents = async ({
  shouldGetMoreEvents,
  showNotification,
  recipientId,
  domain
}) => {
  if (isGettingEvents && !shouldGetMoreEvents) return;

  let optionalToken;
  if (recipientId && domain) {
    optionalToken = getTokenByRecipientId(recipientId, domain);
  }
  isGettingEvents = true;
  if (totalEmailsPending === null) {
    totalEmailsHandled = 0;
    const { status, body } = await fetchEventAction({
      cmd: 101,
      action: 'count',
      optionalToken
    });
    if (status !== 200) {
      stopGettingEvents();
      return;
    }

    const { total } = body;
    if (total) {
      totalEmailsPending = total;
      emitter.emit(Event.UPDATE_LOADING_SYNC, {
        totalTask: total,
        completedTask: 0
      });
    }
  }
  const { status, body } = await fetchEvents(optionalToken);
  if (status !== 200) {
    stopGettingEvents();
    return;
  }

  const { events, hasMoreEvents } = body;
  if (!events.length) {
    stopGettingEvents();
    return;
  }

  const { accountId, accountRecipientId } = await parseAndStoreEventsBatch({
    events,
    hasMoreEvents,
    recipientId,
    domain
  });

  if (!hasMoreEvents) {
    if (showNotification) {
      sendNewEmailNotification(accountId, accountRecipientId);
    } else {
      newEmailNotificationList = [];
    }
    isGettingEvents = false;
    totalEmailsPending = null;
    stopGettingEvents();
    return;
  }
  await getGroupEvents({
    shouldGetMoreEvents: hasMoreEvents,
    showNotification,
    recipientId,
    domain
  });
};

export const isGettingEventsGet = () => isGettingEvents;
export const isGettingEventsUpdate = value => {
  isGettingEvents = value;
};

export const handleEvent = ({
  incomingEvent,
  optionalToken,
  accountRecipientId,
  accountId,
  accountEmail
}) => {
  switch (incomingEvent.cmd) {
    case SocketCommand.NEW_EMAIL: {
      return handleNewMessageEvent(
        incomingEvent,
        optionalToken,
        accountRecipientId,
        accountEmail,
        accountId
      );
    }
    case SocketCommand.EMAIL_TRACKING_UPDATE: {
      return handleEmailTrackingUpdate(incomingEvent, accountId, accountEmail);
    }
    case SocketCommand.SEND_EMAIL_ERROR: {
      return handleSendEmailError(incomingEvent);
    }
    case SocketCommand.LOW_PREKEYS_AVAILABLE: {
      return handleLowPrekeysAvailable(
        incomingEvent,
        accountId,
        accountRecipientId,
        optionalToken
      );
    }
    case SocketCommand.DEVICE_LINK_AUTHORIZATION_REQUEST: {
      //TODO: handle link requests from inactive accounts
      return handleLinkDeviceRequest(incomingEvent, accountRecipientId);
    }
    case SocketCommand.KEYBUNDLE_UPLOADED: {
      //TODO: handle link requests from inactive accounts
      return handleKeybundleUploaded(incomingEvent, accountRecipientId);
    }
    case SocketCommand.DEVICE_REMOVED: {
      return handlePeerRemoveDevice(accountRecipientId);
    }
    case SocketCommand.DEVICE_LINK_REQUEST_RESPONDED: {
      return handleLinkDeviceResquestResponded(incomingEvent);
    }
    case SocketCommand.SYNC_DEVICE_REQUEST: {
      //TODO: handle synk requests from inactive accounts
      return handleSyncDeviceRequest(incomingEvent, accountRecipientId);
    }
    case SocketCommand.SYNC_DEVICE_REQUEST_RESPONDED: {
      return handleSyncDeviceRequestResponded(incomingEvent);
    }
    case SocketCommand.PEER_AVATAR_CHANGED: {
      return handlePeerAvatarChanged(incomingEvent);
    }
    case SocketCommand.PEER_EMAIL_READ_UPDATE: {
      return handlePeerEmailRead(incomingEvent, accountId);
    }
    case SocketCommand.PEER_EMAIL_UNSEND: {
      return handlePeerEmailUnsend(incomingEvent, accountId, accountEmail);
    }
    case SocketCommand.PEER_THREAD_READ_UPDATE: {
      return handlePeerThreadRead(incomingEvent, accountId);
    }
    case SocketCommand.PEER_EMAIL_LABELS_UPDATE: {
      return handlePeerEmailLabelsUpdate(incomingEvent, accountId);
    }
    case SocketCommand.PEER_THREAD_LABELS_UPDATE: {
      return handlePeerThreadLabelsUpdate(incomingEvent, accountId);
    }
    case SocketCommand.PEER_EMAIL_DELETED_PERMANENTLY: {
      return handlePeerEmailDeletedPermanently(incomingEvent, accountId);
    }
    case SocketCommand.PEER_THREAD_DELETED_PERMANENTLY: {
      return handlePeerThreadDeletedPermanently(incomingEvent, accountId);
    }
    case SocketCommand.PEER_LABEL_CREATED: {
      return handlePeerLabelCreated(incomingEvent, accountId);
    }
    case SocketCommand.PEER_LABEL_UPDATE: {
      return handlePeerLabelUpdate(incomingEvent, accountId);
    }
    case SocketCommand.PEER_LABEL_DELETE: {
      return handlePeerLabelDelete(incomingEvent, accountId);
    }
    case SocketCommand.PEER_USER_NAME_CHANGED: {
      return handlePeerUserNameChanged(
        incomingEvent,
        accountRecipientId,
        accountEmail
      );
    }
    case SocketCommand.PEER_PASSWORD_CHANGED: {
      return handlePeerPasswordChanged(accountRecipientId);
    }
    case SocketCommand.PEER_RECOVERY_EMAIL_CHANGED: {
      return handlePeerRecoveryEmailChanged(incomingEvent, accountRecipientId);
    }
    case SocketCommand.PEER_RECOVERY_EMAIL_CONFIRMED: {
      return handlePeerRecoveryEmailConfirmed(accountRecipientId);
    }
    case SocketCommand.PEER_SET_BLOCK_REMOTE_CONTENT: {
      return handleBlockRemoteContentEvent(incomingEvent, accountId);
    }
    case SocketCommand.PEER_SET_TRUSTED_EMAIL: {
      return handlePeerSetTrustedEvent(incomingEvent);
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
    case SocketCommand.SUSPENDED_ACCOUNT_EVENT: {
      return handleSuspendedAccountEvent(incomingEvent, accountRecipientId);
    }
    case SocketCommand.REACTIVATED_ACCOUNT_EVENT: {
      return handleReactivatedAccountEvent(incomingEvent, accountRecipientId);
    }
    case SocketCommand.CUSTOMER_TYPE_UPDATE: {
      return handleCustomerTypeUpdateEvent(incomingEvent, accountRecipientId);
    }
    case SocketCommand.ADDRESS_CREATED: {
      return handleAddressCreatedEvent(incomingEvent, accountId);
    }
    case SocketCommand.ADDRESS_STATUS_UDATE: {
      return handleAddressStatusUpdateEvent(incomingEvent, accountId);
    }
    case SocketCommand.ADDRESS_DELETED: {
      return handlesAddressDeletedEvent(incomingEvent, accountId);
    }
    case SocketCommand.CUSTOM_DOMAIN_CREATED: {
      return handleDomainCreatedEvent(incomingEvent, accountId);
    }
    case SocketCommand.CUSTOM_DOMAIN_DELETED: {
      return handleDomainDeletedEvent(incomingEvent, accountId);
    }
    case SocketCommand.DEFAULT_ADDRESS: {
      return handleDefaultAddressEvent(incomingEvent, accountId);
    }
    case SocketCommand.ADDRESS_NAME_UPDATE: {
      return handleAddressNameUpdateEvent(incomingEvent, accountId);
    }
    default: {
      return { rowid: null };
    }
  }
};

const buildSenderRecipientId = ({ senderId, senderDomain, from, external }) => {
  if (senderDomain && senderId) {
    return senderDomain === appDomain
      ? senderId
      : `${senderId}@${senderDomain}`;
  }

  return external === true
    ? EXTERNAL_RECIPIENT_ID_SERVER
    : getRecipientIdFromEmailAddressTag(from);
};

const isMailSpam = async params => {
  const { labels, from, accountId } = params;
  if (labels && !!labels.find(label => label === LabelType.spam.text))
    return true;
  const contactObjectSpamToCheck = parseContactRow(from);
  const contactSpamToCheck = await getContactByEmails({
    emails: contactObjectSpamToCheck.email,
    accountId
  });
  return contactSpamToCheck[0] ? contactSpamToCheck[0].spamScore > 1 : false;
};

const generateEmailThreadId = async params => {
  const { threadId, inReplyTo } = params;

  const [emailWithMessageId] = await getEmailByParams({
    messageId: inReplyTo
  });
  return emailWithMessageId ? emailWithMessageId.threadId : threadId;
};

const formEmailIfNotExists = async params => {
  const {
    accountId,
    accountEmail,
    accountRecipientId,
    optionalToken,
    metadataKey,
    recipientId,
    deviceId,
    messageType,
    fileKeys,
    fileKey,
    isFromMe,
    isToMe,
    files,
    inReplyTo,
    boundary,
    date,
    from,
    messageId,
    replyTo,
    subject,
    threadId,
    isSpam,
    recipients,
    guestEncryption,
    external
  } = params;

  const labelIds = [];
  let body = '',
    headers,
    myFileKeys;

  try {
    const {
      decryptedBody,
      decryptedHeaders,
      decryptedFileKeys
    } = await signal.decryptEmail({
      accountRecipientId,
      optionalToken,
      bodyKey: metadataKey,
      recipientId,
      deviceId,
      messageType,
      fileKeys: fileKeys || (fileKey ? [fileKey] : null)
    });
    body = cleanEmailBody(decryptedBody);
    headers = decryptedHeaders;
    myFileKeys = decryptedFileKeys
      ? decryptedFileKeys.map(fileKey => {
          const fileKeySplit = fileKey.split(':');
          return {
            key: fileKeySplit[0],
            iv: fileKeySplit[1]
          };
        })
      : null;
  } catch (e) {
    if (
      e.message === signal.ALICE_ERROR ||
      e.message === signal.CONTENT_NOT_AVAILABLE ||
      e instanceof TypeError
    ) {
      return {
        error: 1
      };
    } else if (e.message === signal.DUPLICATE_MESSAGE) {
      return {
        error: 2
      };
    }
    body = 'Content unencrypted';
    if (external) {
      reportContentUnencryptedBob(e.stack);
    } else {
      reportContentUnencrypted(e.stack);
    }
  }

  if (!fileKeys && fileKey) {
    myFileKeys = files.map(() => myFileKeys[0]);
  }
  const unread = isFromMe && !isToMe ? false : true;
  const emailThreadId = inReplyTo
    ? await generateEmailThreadId({
        threadId,
        inReplyTo
      })
    : threadId;

  const secure = guestEncryption === 1 || guestEncryption === 3;
  const data = {
    body,
    boundary,
    date,
    deviceId,
    from,
    isFromMe,
    metadataKey,
    guestEncryption,
    messageId,
    replyTo,
    secure,
    subject,
    threadId: emailThreadId,
    unread
  };
  const email = await formIncomingEmailFromData(data);
  const notificationPreview = email.preview;
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
    labelIds.push(LabelType.sent.id);
    if (isToMe) {
      labelIds.push(LabelType.inbox.id);
    }
  } else {
    labelIds.push(LabelType.inbox.id);
  }
  if (isSpam) {
    labelIds.push(LabelType.spam.id);
  }
  const emailData = {
    accountId,
    accountEmail,
    email,
    labels: labelIds,
    files: filesData,
    recipients,
    body,
    headers
  };
  await createEmail(emailData);

  return {
    labelIds,
    notificationPreview,
    emailThreadId
  };
};

const formEmailIfExists = async params => {
  const { accountId, prevEmail, isFromMe, isToMe, isSpam, threadId } = params;

  const labelIds = [];
  const InboxLabelId = LabelType.inbox.id;
  const SentLabelId = LabelType.sent.id;
  const SpamLabelId = LabelType.spam.id;

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
    const emailLabels = formEmailLabel({
      emailId: prevEmail.id,
      labels: labelIds
    });
    await createEmailLabel({ emailLabels, accountId });
  }
  const notificationPreview = prevEmail.preview;

  return {
    labelIds,
    notificationPreview,
    emailThreadId: threadId
  };
};

const handleNewMessageEvent = async (
  { rowid, params },
  optionalToken,
  accountRecipientId,
  accountEmail,
  accountId
) => {
  const {
    bcc,
    bccArray,
    cc,
    ccArray,
    date,
    fileKey,
    fileKeys,
    files,
    from: rawFrom,
    guestEncryption,
    inReplyTo,
    replyTo,
    labels,
    messageType,
    metadataKey,
    senderDomain,
    senderId,
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
  const from = rawFrom.replace(/"/g, '');
  const recipientId = buildSenderRecipientId({
    senderId,
    senderDomain,
    from,
    external
  });
  const deviceId =
    external === undefined
      ? typeof messageType === 'number'
        ? senderDeviceId
        : undefined
      : senderDeviceId;
  const [prevEmail] = await getEmailByKey({ key: metadataKey, accountId });

  const isFromMe = accountRecipientId === recipientId;
  const isSpam = isFromMe
    ? false
    : await isMailSpam({
        accountId,
        labels,
        from
      });
  const recipients = getRecipientsFromData({
    to: to || toArray,
    cc: cc || ccArray,
    bcc: bcc || bccArray,
    from
  });
  const aliases = await getAlias({
    accountId
  });
  const aliasesRecipients = aliases.map(
    alias => (alias.domain ? `${alias.name}@${alias.domain}` : alias.name)
  );
  const isToMe =
    [accountRecipientId, ...aliasesRecipients].findIndex(recipientId =>
      checkEmailIsTo(recipients, recipientId)
    ) > -1;
  const { error, notificationPreview, emailThreadId, labelIds } = !prevEmail
    ? await formEmailIfNotExists({
        accountId,
        accountEmail,
        accountRecipientId,
        optionalToken,
        metadataKey,
        recipientId,
        deviceId,
        messageType,
        fileKeys,
        fileKey,
        isFromMe,
        isToMe,
        files,
        inReplyTo,
        boundary,
        date,
        from,
        messageId,
        replyTo,
        subject,
        threadId,
        isSpam,
        recipients,
        guestEncryption,
        external
      })
    : await formEmailIfExists({
        accountId,
        prevEmail,
        isFromMe,
        isToMe,
        isSpam,
        threadId
      });

  if (error) {
    return {
      rowid: error === 1 ? null : rowid
    };
  }

  const isToOneOfMyAccounts = checkEmailsToAllAccounts(recipients);
  if (isToOneOfMyAccounts && !isSpam) {
    const parsedContact = parseContactRow(from);
    addEmailToNotificationList({
      senderInfo: parsedContact.name || parsedContact.email,
      emailSubject: subject,
      emailPreview: notificationPreview,
      threadId: emailThreadId
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

const sendNewEmailNotification = (accountId, accountRecipientId) => {
  if (newEmailNotificationList.length <= 3) {
    newEmailNotificationList.forEach(notificationData => {
      const {
        emailSubject,
        emailPreview,
        senderInfo,
        threadId
      } = notificationData;
      const subject = emailSubject || `(${string.mailbox.empty_subject})`;
      const message = getShowEmailPreviewStatus()
        ? `${subject}\n${emailPreview}`
        : `${subject}`;
      showNotificationApp({
        title: senderInfo,
        message,
        threadId,
        accountId,
        accountRecipientId
      });
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

const handleEmailTrackingUpdate = async (
  { rowid, params },
  accountId,
  accountEmail
) => {
  const { date, metadataKey, type, fromDomain } = params;
  const [email] = await getEmailByKey({ key: metadataKey, accountId });
  const isUnsend = type === EmailStatus.UNSEND;
  let feedItemAdded = false;
  if (email) {
    const preview = isUnsend ? '' : null;
    const status = validateEmailStatusToSet(email.status, type);
    const unsentDate = isUnsend ? date : null;
    if (status || preview || unsentDate) {
      await updateEmail({
        accountId,
        key: String(metadataKey),
        status,
        preview,
        unsentDate
      });
      if (isUnsend) {
        await updateFilesByEmailId({
          emailId: email.id,
          status: AttachItemStatus.UNSENT
        });
        await deleteEmailContent({ metadataKey, accountEmail });
      }

      const { domain, recipientId } = fromDomain;
      const isOpened = type === EmailStatus.READ;
      if (isOpened) {
        const contactEmail = `${recipientId}@${domain}`;
        const [contact] = await getContactByEmails({
          emails: [contactEmail],
          accountId
        });
        if (contact) {
          const contactId = contact.id;
          const feedItemParams = {
            accountId,
            date,
            type,
            emailId: email.id,
            contactId
          };
          await createFeedItem(feedItemParams);
          feedItemAdded = true;
        }
      }
    }
  }
  if (!email && isUnsend) return { rowid: null };
  return { rowid, threadIds: email ? [email.threadId] : [], feedItemAdded };
};

const handlePeerAvatarChanged = ({ rowid }) => {
  return { rowid, profileChanged: true };
};

const handlePeerEmailRead = async ({ rowid, params }, accountId) => {
  const { metadataKeys, unread } = params;
  const emails = await getEmailsByArrayParam({
    array: { keys: metadataKeys },
    accountId
  });
  if (emails.length) {
    const emailKeys = emails.map(email => email.key);
    const [res] = await updateEmails({
      accountId,
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

const handlePeerEmailUnsend = async (
  { rowid, params },
  accountId,
  accountEmail
) => {
  const type = EmailStatus.UNSEND;
  const { metadataKey, date } = params;
  const [email] = await getEmailByKey({ key: metadataKey, accountId });
  if (email) {
    const status = validateEmailStatusToSet(email.status, type);
    await unsendEmail({
      accountId,
      key: String(metadataKey),
      content: '',
      preview: '',
      status,
      unsentDate: date
    });
    await updateFilesByEmailId({
      emailId: email.id,
      status: AttachItemStatus.UNSENT
    });
    await deleteEmailContent({ metadataKey, accountEmail });
  }
  return { rowid, threadIds: email ? [email.threadId] : [] };
};

const handleLinkDeviceRequest = ({ rowid, params }, accountRecipientId) => {
  if (accountRecipientId !== myAccount.recipientId) {
    return { rowid: null };
  }
  sendStartLinkDevicesEvent({ rowid, params });
  return { rowid: null };
};

const handleLinkDeviceResquestResponded = async ({ recipientId, domain }) => {
  const eventRecipientId =
    domain === appDomain ? recipientId : `${recipientId}@${domain}`;
  if (eventRecipientId === myAccount.recipientId)
    await sendEndLinkDevicesEvent();
  return { rowid: null };
};

const handleKeybundleUploaded = ({ rowid }, accountRecipientId) => {
  if (accountRecipientId !== myAccount.recipientId) {
    return { rowid: null };
  }
  return { rowid };
};

const handleSyncDeviceRequest = ({ rowid, params }, accountRecipientId) => {
  if (accountRecipientId !== myAccount.recipientId) {
    return { rowid: null };
  }
  sendStartSyncDeviceEvent({ rowid, params });
  return { rowid: null };
};

const handleSyncDeviceRequestResponded = async ({ recipientId, domain }) => {
  const eventRecipientId =
    domain === appDomain ? recipientId : `${recipientId}@${domain}`;
  if (eventRecipientId === myAccount.recipientId)
    await sendEndSyncDevicesEvent();
  return { rowid: null };
};

const handlePeerRemoveDevice = accountRecipientId => {
  if (accountRecipientId !== myAccount.recipientId) {
    return { rowid: null };
  }
  sendDeviceRemovedEvent(true);
  return { rowid: null };
};

const handlePeerThreadRead = async ({ rowid, params }, accountId) => {
  const { threadIds, unread } = params;
  const [res] = await updateUnreadEmailByThreadIds({
    accountId,
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

const handlePeerEmailLabelsUpdate = async ({ rowid, params }, accountId) => {
  const { metadataKeys, labelsRemoved, labelsAdded } = params;
  const emailIds = [];
  const threadIds = [];
  for (const metadataKey of metadataKeys) {
    const [email] = await getEmailByKey({ key: metadataKey, accountId });
    if (email) {
      emailIds.push(email.id);
      threadIds.push(email.threadId);
    }
  }
  if (!emailIds.length) return { rowid: null };
  const labelsToRemove = await getLabelsByText({
    text: labelsRemoved,
    accountId
  });
  const labelIdsToRemove = labelsToRemove.map(label => label.id);
  const labelsToAdd = await getLabelsByText({ text: labelsAdded, accountId });
  const labelIdsToAdd = labelsToAdd.map(label => label.id);

  await formAndSaveEmailLabelsUpdate({
    accountId,
    emailIds,
    labelIdsToAdd,
    labelIdsToRemove
  });

  const isAddedToSpam = labelIdsToAdd.includes(LabelType.spam.id);
  if (isAddedToSpam) {
    const notEmailAddress = myAccount.email;
    await updateContactSpamScore({ emailIds, notEmailAddress, value: 1 });
  }

  const isRemovedToSpam = labelIdsToRemove.includes(LabelType.spam.id);
  if (isRemovedToSpam) {
    const notEmailAddress = myAccount.email;
    await updateContactSpamScore({ emailIds, notEmailAddress, value: -1 });
  }

  const hasInbox =
    labelIdsToAdd.includes(LabelType.inbox.id) ||
    labelIdsToRemove.includes(LabelType.inbox.id) ||
    labelIdsToAdd.includes(LabelType.trash.id);
  const hasSpam = isAddedToSpam || isRemovedToSpam;
  let badgeLabelIds = [];
  if (hasInbox) badgeLabelIds = [...badgeLabelIds, LabelType.inbox.id];
  if (hasSpam) badgeLabelIds = [...badgeLabelIds, LabelType.spam.id];

  return { rowid, threadIds, badgeLabelIds };
};

const handlePeerThreadLabelsUpdate = async ({ rowid, params }, accountId) => {
  const { threadIds, labelsRemoved, labelsAdded } = params;
  const emails = await getEmailsIdsByThreadIds({ threadIds, accountId });
  const emailIds = emails.map(email => email.id);
  if (!emailIds.length) return { rowid };

  const labelsToRemove = await getLabelsByText({
    text: labelsRemoved,
    accountId
  });
  const labelIdsToRemove = labelsToRemove.map(label => label.id);

  const labelsToAdd = await getLabelsByText({ text: labelsAdded, accountId });
  const labelIdsToAdd = labelsToAdd.map(label => label.id);

  await formAndSaveEmailLabelsUpdate({
    accountId,
    emailIds,
    labelIdsToAdd,
    labelIdsToRemove
  });

  const isAddedToSpam = labelIdsToAdd.includes(LabelType.spam.id);
  if (isAddedToSpam) {
    const notEmailAddress = myAccount.email;
    await updateContactSpamScore({ emailIds, notEmailAddress, value: 1 });
  }

  const isRemovedToSpam = labelIdsToRemove.includes(LabelType.spam.id);
  if (isRemovedToSpam) {
    const notEmailAddress = myAccount.email;
    await updateContactSpamScore({ emailIds, notEmailAddress, value: -1 });
  }

  const hasInbox =
    labelIdsToAdd.includes(LabelType.inbox.id) ||
    labelIdsToRemove.includes(LabelType.inbox.id) ||
    labelIdsToAdd.includes(LabelType.trash.id);
  const hasSpam = isAddedToSpam || isRemovedToSpam;
  let badgeLabelIds = [];
  if (hasInbox) badgeLabelIds = [...badgeLabelIds, LabelType.inbox.id];
  if (hasSpam) badgeLabelIds = [...badgeLabelIds, LabelType.spam.id];
  return { rowid, threadIds, badgeLabelIds };
};

const formAndSaveEmailLabelsUpdate = async ({
  accountId,
  emailIds,
  labelIdsToAdd,
  labelIdsToRemove
}) => {
  const formattedEmailLabelsToAdd = emailIds.reduce((result, emailId) => {
    const emailLabel = formEmailLabel({ emailId, labels: labelIdsToAdd });
    return [...result, ...emailLabel];
  }, []);

  if (labelIdsToRemove.length) {
    await deleteEmailLabel({ emailIds, labelIds: labelIdsToRemove, accountId });
  }
  if (formattedEmailLabelsToAdd.length) {
    await createEmailLabel({
      emailLabels: formattedEmailLabelsToAdd,
      accountId
    });
  }
};

const handlePeerEmailDeletedPermanently = async (
  { rowid, params },
  accountId
) => {
  const { metadataKeys } = params;
  const threadIds = [];
  const keys = [];
  for (const metadataKey of metadataKeys) {
    const [email] = await getEmailByKey({ key: metadataKey, accountId });
    if (email) {
      keys.push(email.key);
      threadIds.push(email.threadId);
    }
  }
  await deleteEmailByKeys({ keys, accountId });
  const labelIds = [LabelType.trash.id, LabelType.spam.id];
  return { rowid, threadIds, labelIds };
};

const handlePeerThreadDeletedPermanently = async (
  { rowid, params },
  accountId
) => {
  const { threadIds } = params;
  await deleteEmailsByThreadIdAndLabelId({ threadIds, accountId });
  const labelIds = [LabelType.trash.id, LabelType.spam.id];
  return { rowid, threadIds, labelIds };
};

const handlePeerLabelCreated = async ({ rowid, params }, accountId) => {
  const { text, color, uuid } = params;
  const [label] = await getLabelsByText({ text: [text], accountId });
  if (!label) {
    const labelCreated = await createLabel({ text, color, uuid, accountId });
    const labelId = labelCreated.id;
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

const handlePeerLabelUpdate = async ({ rowid, params }, accountId) => {
  const { uuid, text } = params;
  const [label] = await getLabelByUuid({ uuid, accountId });
  if (!label) return { rowid };
  const response = updateLabelDB({ id: label.id, text, accountId });
  if (!response) return { rowid: null };
  return { rowid, updatedLabel: { id: label.id, text } };
};

const handlePeerLabelDelete = async ({ rowid, params }, accountId) => {
  const { uuid } = params;
  const [label] = await getLabelByUuid({ uuid, accountId });
  if (!label) return { rowid };
  const response = await deleteLabelById({ id: label.id, accountId });
  if (!response) return { rowid: null };
  return { rowid, removedLabel: label.id };
};

const handlePeerUserNameChanged = async (
  { rowid, params },
  accountRecipientId,
  accountEmail
) => {
  const { name } = params;
  const recipientId = accountRecipientId || myAccount.recipientId;
  const email = accountEmail || myAccount.email;
  await updateAccount({ name, recipientId });
  await updateContactByEmail({ email, name });
  return { rowid, profileChanged: true };
};

const handlePeerPasswordChanged = accountRecipientId => {
  if (accountRecipientId !== myAccount.recipientId) {
    return { rowid: null };
  }
  sendPasswordChangedEvent();
  return { rowid: null };
};

const handlePeerRecoveryEmailChanged = ({ params }, accountRecipientId) => {
  if (accountRecipientId !== myAccount.recipientId) {
    return { rowid: null };
  }
  const { address } = params;
  emitter.emit(Event.RECOVERY_EMAIL_CHANGED, address);
  return { rowid: null };
};

const handlePeerRecoveryEmailConfirmed = accountRecipientId => {
  if (accountRecipientId !== myAccount.recipientId) {
    return { rowid: null };
  }
  emitter.emit(Event.RECOVERY_EMAIL_CONFIRMED);
  return { rowid: null };
};

const handleNewAnnouncementEvent = async ({ rowid, params }) => {
  const { code, version, operator } = params;
  const updateAnnouncement = await getNews({ code });
  if (!updateAnnouncement) return { rowid };
  if (updateAnnouncement.largeImageUrl) {
    handleNewAnnouncement(updateAnnouncement, version, parseInt(operator));
    return { rowid };
  }
  const messageData = {
    ...Messages.news.announcement,
    type: MessageType.ANNOUNCEMENT,
    description: updateAnnouncement.title
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
  return { rowid };
};

const handleNewAnnouncement = (announcement, version, operator) => {
  const OPERATOR = {
    LESS_THAN: 1,
    LESS_EQUAL: 2,
    EQUAL: 3,
    GREATER_EQUAL: 4,
    GREATER_THAN: 5
  };
  let shouldShowAnnouncement = true;
  switch (operator) {
    case OPERATOR.LESS_THAN:
      shouldShowAnnouncement = semver.lt(appVersion, version);
      break;
    case OPERATOR.LESS_EQUAL:
      shouldShowAnnouncement = semver.lte(appVersion, version);
      break;
    case OPERATOR.EQUAL:
      shouldShowAnnouncement = semver.eq(appVersion, version);
      break;
    case OPERATOR.GREATER_EQUAL:
      shouldShowAnnouncement = semver.gte(appVersion, version);
      break;
    case OPERATOR.GREATER_THAN:
      shouldShowAnnouncement = semver.gt(appVersion, version);
      break;
    default:
      break;
  }
  if (!shouldShowAnnouncement) return;

  emitter.emit(Event.BIG_UPDATE_AVAILABLE, {
    ...announcement,
    showUpdateNow: semver.gt(version, appVersion)
  });
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

const handleSuspendedAccountEvent = accountRecipientId => {
  if (accountRecipientId !== myAccount.recipientId) {
    return { rowid: null };
  }
  sendSuspendedAccountEvent();
  return { rowid: null };
};

const handleReactivatedAccountEvent = accountRecipientId => {
  if (accountRecipientId !== myAccount.recipientId) {
    return { rowid: null };
  }
  emitter.emit(Event.REACTIVATED_ACCOUNT);
  return { rowid: null };
};

const handleCustomerTypeUpdateEvent = async (
  { rowid, params },
  accountRecipientId
) => {
  const { newCustomerType } = params;
  const recipientId = accountRecipientId || myAccount.recipientId;

  await updateAccount({ customerType: newCustomerType, recipientId });
  return { rowid, profileChanged: true };
};

const handleAddressCreatedEvent = async ({ rowid, params }, accountId) => {
  const { addressId, addressName, addressDomain } = params;

  const [existingAlias] = await getAlias({
    rowId: addressId,
    accountId
  });
  if (existingAlias) return { rowid };

  const alias = {
    rowId: addressId,
    name: addressName,
    domain: addressDomain === appDomain ? null : addressDomain,
    accountId
  };
  await createAlias(alias);
  return { rowid };
};

const handlePeerSetTrustedEvent = async ({ rowid, params }) => {
  const { email, trusted } = params;
  const [contact] = await getContactByEmails({ emails: [email] });
  if (!contact) return { rowid };
  const response = await updateContactByEmail({ email, isTrusted: trusted });
  if (!response) return { rowid: null };
  const contactId = contact.id;
  emitter.emit(Event.CHANGE_SET_TRUSTED_ACCOUNT, {
    contactId,
    isTrusted: trusted
  });
  return { rowid };
};

const handleBlockRemoteContentEvent = async ({ rowid, params }, accountId) => {
  const { recipientId, block } = params;
  await changeEmailBlockedAccount({
    id: accountId,
    recipientId,
    blockRemoteContent: block ? 1 : 0
  });
  return { rowid };
};

const handleAddressStatusUpdateEvent = async ({ rowid, params }, accountId) => {
  const { addressId, activate } = params;
  const alias = {
    rowId: addressId,
    active: activate,
    accountId
  };
  await updateAlias(alias);
  return { rowid };
};

const handlesAddressDeletedEvent = async ({ rowid, params }, accountId) => {
  const { addressId } = params;
  const aliases = {
    rowIds: [addressId],
    accountId
  };
  await deleteAliases(aliases);
  return { rowid };
};

const handleDomainCreatedEvent = async ({ rowid, params }, accountId) => {
  const { customDomain } = params;

  const [existingDomain] = await getCustomDomainByParams({
    name: customDomain,
    accountId
  });
  if (existingDomain) return { rowid };

  const domain = {
    name: customDomain,
    validated: false,
    accountId
  };
  await createCustomDomain(domain);
  return { rowid };
};

const handleDomainDeletedEvent = async ({ rowid, params }, accountId) => {
  const { customDomain } = params;
  const domain = {
    name: customDomain,
    accountId
  };
  await deleteCustomDomainByName(domain);
  return { rowid };
};

const handleDefaultAddressEvent = async ({ rowid, params }, accountId) => {
  const { addressId = null } = params;
  await updateAccountDefaultAddress({
    defaultAddressId: addressId,
    accountId
  });
  return { rowid };
};

const handleAddressNameUpdateEvent = async ({ rowid, params }, accountId) => {
  const { addressId, fullname } = params;

  const [existingAlias] = await getAlias({
    rowId: addressId,
    accountId
  });
  if (!existingAlias) return { rowid };

  await createOrUpdateContact({
    email: `${existingAlias.name}@${existingAlias.domain || appDomain}`,
    name: fullname,
    isTrusted: true
  });

  return { rowid };
};

const handleSendEmailError = ({ rowid }) => {
  return { rowid };
};

const handleLowPrekeysAvailable = async (
  { rowid },
  accountId,
  accountRecipientId,
  optionalToken
) => {
  await signal.generateAndInsertMorePreKeys(
    accountId,
    accountRecipientId,
    optionalToken
  );
  return { rowid };
};

const setEventAsHandled = async (eventIds, optionalToken) => {
  return await fetchAcknowledgeEvents({ eventIds, optionalToken });
};

/*  Window events: listener
----------------------------- */
export const sendLoadEventsEvent = params => {
  emitter.emit(Event.LOAD_EVENTS, params);
};

ipcRenderer.on('backup-progress', (ev, data) => {
  emitter.emit(Event.BACKUP_PROGRESS, data);
});

ipcRenderer.on('socket-message', async (ev, message) => {
  const { cmd, recipientId, domain } = message;
  if (cmd === 400) {
    sendLoadEventsEvent({
      showNotification: true,
      recipientId,
      domain
    });
  } else {
    if (isGettingEvents) return;
    isGettingEvents = true;
    await parseAndDispatchEvent(message, recipientId, domain);
    isGettingEvents = false;
  }
});

ipc.answerMain('get-events', async () => {
  await restartConnection();
  sendLoadEventsEvent({});
});

ipc.answerMain('get-show-preview', () => {
  return getShowEmailPreviewStatus();
});

ipc.answerMain('set-show-preview', showPreview => {
  return setShowEmailPreviewStatus(showPreview);
});

ipcRenderer.on('refresh-window-logged-as', (ev, { accountId, recipientId }) => {
  emitter.emit(Event.LOAD_APP, { accountId, recipientId });
});

ipcRenderer.on('update-drafts', (ev, shouldUpdateBadge) => {
  const labelId = shouldUpdateBadge ? LabelType.draft.id : undefined;
  sendRefreshThreadsEvent({ labelIds: [labelId] });
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
      case 'reply': {
        const { threadId } = threadData;
        emitter.emit(Event.STORE_LOAD, {
          labelIds: [LabelType.sent.id],
          threadIds: [threadId]
        });
        break;
      }
      default:
        break;
    }
  }
);

ipcRenderer.on('composer-email-delete', (ev, { threadId }) => {
  emitter.emit(Event.STORE_LOAD, {
    labelIds: [LabelType.sent.id, LabelType.draft.id],
    badgeLabelIds: [LabelType.draft.id],
    threadIds: [threadId]
  });
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
    ...Messages.error.emailSent,
    type: MessageType.ERROR
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
});

ipcRenderer.on('send-recovery-email', () => {
  const messageData = {
    ...Messages.success.sendRecoveryEmail,
    type: MessageType.SUCCESS
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
});

ipcRenderer.on('open-recovery-email-mailbox', (ev, params) => {
  const {
    recipientId: composerRecipientId,
    accountId: composerAccountId
  } = params;
  if (composerRecipientId === myAccount.recipientId) {
    emitter.emit(Event.REDIRECT_TO_OPEN_RECOVERY_EMAIL);
    focusMailbox();
  } else {
    emitter.emit(Event.REDIRECT_TO_OPEN_RECOVERY_EMAIL_CHANGE_ACCOUNT, {
      composerAccountId,
      composerRecipientId
    });
  }
});

ipcRenderer.on('update-thread-emails', (ev, data) => {
  const { threadId, newEmailId, oldEmailId } = data;
  emitter.emit(Event.UPDATE_THREAD_EMAILS, {
    threadId,
    newEmailId,
    oldEmailId
  });
});

ipcRenderer.on('device-removed', (ev, accountRecipientId) => {
  if (accountRecipientId !== myAccount.recipientId) {
    return;
  }
  sendDeviceRemovedEvent(false);
});

ipcRenderer.on('password-changed', (ev, accountRecipientId) => {
  if (accountRecipientId !== myAccount.recipientId) {
    return;
  }
  return sendPasswordChangedEvent();
});

ipcRenderer.on('suspended-account', (ev, accountRecipientId) => {
  if (accountRecipientId !== myAccount.recipientId) {
    return;
  }
  return sendSuspendedAccountEvent();
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

ipcRenderer.on('save-draft-success', () => {
  const messageData = {
    ...Messages.success.save_draft,
    type: MessageType.SUCCESS
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
});

ipcRenderer.on('save-draft-failed', () => {
  const messageData = {
    ...Messages.error.save_draft,
    type: MessageType.ERROR
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
});

/* Window events: handle */
ipcRenderer.on(
  'open-mailto-in-composer',
  (ev, { subject, content, emailAddress }) => {
    openFilledComposerWindow({
      type: composerEvents.NEW_WITH_DATA,
      data: {
        email: { subject, content },
        recipients: { to: emailAddress },
        status: SEND_BUTTON_STATUS.ENABLED
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
export const sendAliasSuccessStatusMessage = active => {
  const message = active
    ? Messages.success.aliasActivated
    : Messages.success.aliasDeactivated;
  const messageData = {
    ...message,
    type: MessageType.SUCCESS
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
};

export const sendBackupEnabledMessage = () => {
  const messageData = {
    ...Messages.success.backupEnabled,
    type: MessageType.SUCCESS
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
};

export const sendCustomDomainDeletedMessage = () => {
  const messageData = {
    ...Messages.success.customDomainDeleted,
    type: MessageType.SUCCESS
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

export const sendDeviceRemovedEvent = deleteData => {
  emitter.emit(Event.DEVICE_REMOVED, null);
  handleDeleteDeviceData(deleteData);
};

export const sendPasswordChangedEvent = () => {
  emitter.emit(Event.PASSWORD_CHANGED, null);
  return { rowid: null };
};

export const sendSuspendedAccountEvent = () => {
  emitter.emit(Event.SUSPENDED_ACCOUNT, null);
  return { rowid: null };
};

export const sendRefreshThreadsEvent = eventParams => {
  emitter.emit(Event.REFRESH_THREADS, eventParams);
};

export const sendRestoreBackupInitEvent = () => {
  emitter.emit(Event.RESTORE_BACKUP_INIT);
};

export const handleDeleteDeviceData = deleteData => {
  if (deleteDataIntervalId) return;
  deleteDataIntervalId = setTimeout(async () => {
    await deleteAllDeviceData(myAccount.recipientId, deleteData);
    deleteDataIntervalId = null;
  }, 4000);
};

export const deleteAllDeviceData = async (recipientId, deleteData) => {
  const nextAccount = deleteData
    ? await cleanDatabase(recipientId)
    : await cleanDataLogout({ recipientId });
  if (!nextAccount) {
    await logoutApp();
    return;
  }
  emitter.emit(Event.LOAD_APP, {
    accountId: nextAccount.id,
    recipientId: nextAccount.recipientId
  });
};

export const sendRefreshMailboxSync = () => {
  emitter.emit(Event.REFRESH_MAILBOX_SYNC);
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

export const sendBlockRemoteContentTurnedOff = () => {
  const messageData = {
    ...Messages.success.blockRemoteTurnOff,
    type: MessageType.SUCCESS
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
};

export const sendContactIsTrusted = () => {
  const messageData = {
    ...Messages.success.contactIsTrusted,
    type: MessageType.SUCCESS
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
};

export const sendBlockRemoteContentTurnedOn = () => {
  const messageData = {
    ...Messages.success.blockRemoteTurnOn,
    type: MessageType.SUCCESS
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
};

export const sendBlockRemoteContentError = () => {
  const messageData = {
    ...Messages.error.blockRemoteTurnOff,
    type: MessageType.ERROR
  };
  emitter.emit(Event.DISPLAY_MESSAGE, messageData);
};

export const sendAccountDeletedEvent = () => {
  emitter.emit(Event.ACCOUNT_DELETED);
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

export const selectAccountAsActive = async ({ accountId, recipientId }) => {
  await changeAccountApp(accountId);
  showLoggedAsMessage(recipientId);
};

export const showLoggedAsMessage = recipientId => {
  const email = recipientId.includes('@')
    ? recipientId
    : `${recipientId}@${appDomain}`;
  const messageData = {
    ...Messages.success.loggedAs,
    description: Messages.success.loggedAs.description + email,
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

ipcRenderer.on(NOTIFICATION_RECEIVED, async (_, { data }) => {
  try {
    switch (data.action) {
      case NOTIFICATION_ACTIONS.NEW_EMAIL: {
        if (isGettingEvents) return;
        isGettingEvents = true;
        const { status, body } = await fetchGetSingleEvent({
          rowId: data.rowId
        });
        if (status === 200) {
          const [email] = await getEmailByKey({ key: body.params.metadataKey });
          if (!email) {
            const { account: recipientId, domain } = data;
            const {
              accountId,
              accountRecipientId
            } = await parseAndDispatchEvent(body, recipientId, domain);
            sendNewEmailNotification(accountId, accountRecipientId);
            sendLoadEventsEvent({ showNotification: true });
          }
        }
        isGettingEvents = false;
        emitter.emit(Event.STOP_LOAD_SYNC, {});
        break;
      }
      case NOTIFICATION_ACTIONS.OPEN_EMAIL: {
        if (data.subject) {
          const title = string.notification.openEmail.title;
          const message = string.notification.openEmail.message.replace(
            '<subject>',
            data.subject
          );
          showNotificationApp({ title, message });
        }
        break;
      }
      default:
        break;
    }
  } catch (firebaseNotifErr) {
    // eslint-disable-next-line no-console
    console.error(`[Firebase Error]: `, firebaseNotifErr);
  }
});

ipcRenderer.send(START_NOTIFICATION_SERVICE, senderNotificationId);

ipcRenderer.on('open-thread-by-notification', (ev, { threadId }) => {
  emitter.emit(Event.OPEN_THREAD, { threadId });
});

ipcRenderer.on('swap-account', (ev, { accountId, recipientId, threadId }) => {
  emitter.emit(Event.LOAD_APP, { accountId, recipientId, threadId });
});

/*  Local backup
----------------------------- */
ipcRenderer.on('local-backup-disable-events', () => {
  emitter.emit(Event.LOCAL_BACKUP_DISABLE_EVENTS);
});

ipcRenderer.on('local-backup-enable-events', (ev, params) => {
  emitter.emit(Event.LOCAL_BACKUP_ENABLE_EVENTS, params);
});

ipcRenderer.on('local-backup-export-finished', (ev, params) => {
  emitter.emit(Event.LOCAL_BACKUP_EXPORT_FINISHED, params);
});

ipcRenderer.on('local-backup-encrypt-finished', () => {
  emitter.emit(Event.LOCAL_BACKUP_ENCRYPT_FINISHED);
});

ipcRenderer.on('local-backup-started', (ev, params) => {
  emitter.emit(Event.LOCAL_BACKUP_STARTED, params);
});

ipcRenderer.on('local-backup-success', (ev, params) => {
  emitter.emit(Event.LOCAL_BACKUP_SUCCESS, params);
});

ipcRenderer.on('local-backup-failed', (ev, params) => {
  emitter.emit(Event.LOCAL_BACKUP_FAILED, params);
});

ipcRenderer.on('open-plus', () => {
  emitter.emit(Event.OPEN_PLUS);
});

ipcRenderer.on('restore-backup-disable-events', () => {
  emitter.emit(Event.RESTORE_BACKUP_DISABLE_EVENTS);
});

ipcRenderer.on('restore-backup-enable-events', (ev, error) => {
  emitter.emit(Event.RESTORE_BACKUP_ENABLE_EVENTS, error);
});

ipcRenderer.on('restore-backup-finished', () => {
  emitter.emit(Event.RESTORE_BACKUP_FINISHED);
});

ipcRenderer.on('restore-backup-success', () => {
  emitter.emit(Event.RESTORE_BACKUP_SUCCESS);
});

/*  Events
----------------------------- */
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
  BACKUP_PROGRESS: 'backup-progress',
  BIG_UPDATE_AVAILABLE: 'big-update-available',
  CHANGE_SET_TRUSTED_ACCOUNT: 'change-set-trusted-account',
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
  LOCAL_BACKUP_DISABLE_EVENTS: 'local-backup-disable-events',
  LOCAL_BACKUP_ENABLE_EVENTS: 'local-backup-enable-events',
  LOCAL_BACKUP_EXPORT_FINISHED: 'local-backup-export-finished',
  LOCAL_BACKUP_ENCRYPT_FINISHED: 'local-backup-encrypt-finished',
  LOCAL_BACKUP_STARTED: 'local-backup-started',
  LOCAL_BACKUP_SUCCESS: 'local-backup-success',
  LOCAL_BACKUP_FAILED: 'local-backup-failed',
  OPEN_PLUS: 'open-plus',
  OPEN_THREAD: 'open-thread',
  PASSWORD_CHANGED: 'password-changed',
  REACTIVATED_ACCOUNT: 'reactivated-account',
  RECOVERY_EMAIL_CHANGED: 'recovery-email-changed',
  RECOVERY_EMAIL_CONFIRMED: 'recovery-email-confirmed',
  REDIRECT_TO_OPEN_RECOVERY_EMAIL: 'redirect-to-open-recovery-email',
  REDIRECT_TO_OPEN_RECOVERY_EMAIL_CHANGE_ACCOUNT:
    'redirect-to-open-recovery-email-change-account',
  REFRESH_MAILBOX_SYNC: 'refresh-mailbox-sync',
  REFRESH_THREADS: 'refresh-threads',
  RESTORE_BACKUP_INIT: 'restore-backup-init',
  RESTORE_BACKUP_DISABLE_EVENTS: 'restore-backup-disable-events',
  RESTORE_BACKUP_ENABLE_EVENTS: 'restore-backup-enable-events',
  RESTORE_BACKUP_FINISHED: 'restore-backup-finished',
  RESTORE_BACKUP_SUCCESS: 'restore-backup-success',
  SHOW_USER_GUIDE_STEP: 'show-user-guide-step',
  SETTINGS_OPENED: 'settings-opened',
  SET_SECTION_TYPE: 'set-section-type',
  STORE_LOAD: 'store-load',
  STOP_LOAD_SYNC: 'stop-load-sync',
  SUSPENDED_ACCOUNT: 'suspended-account',
  UPDATE_AVAILABLE: 'update-available',
  UPDATE_LOADING_SYNC: 'update-loading-sync',
  UPDATE_THREAD_EMAILS: 'update-thread-emails'
};
