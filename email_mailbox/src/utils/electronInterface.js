import { labels } from './systemLabels';
import { openDialogWindow } from './ipc';

const electron = window.require('electron');
const { remote, ipcRenderer } = electron;
const { getCurrentWindow } = remote;
const dbManager = remote.require('./src/DBManager');
const clientManager = remote.require('./src/clientManager');
const newsClient = remote.require('./src/newsClient');

export const { requiredMinLength, requiredMaxLength } = remote.require(
  './src/validationConsts'
);

export const { FILE_SERVER_APP_ID, FILE_SERVER_KEY } = remote.require(
  './src/utils/const'
);

const additionalLabels = {
  search: {
    id: -1,
    text: 'Search'
  },
  allmail: {
    id: -1,
    text: 'All Mail'
  }
};
export const LabelType = Object.assign(labels, additionalLabels);
export const myAccount = remote.require('./src/Account');

const globalManager = remote.require('./src/globalManager');
export const setInternetConnectionStatus = status => {
  globalManager.internetConnection.setStatus(status);
};

export const mySettings = remote.require('./src/Settings');

export const errors = remote.require('./src/errors');

/*  Window events
----------------------------- */
export const confirmPermanentDeleteThread = callback => {
  // eslint-disable-next-line no-undef
  const string = require('./../lang');
  const texts = string.default.dialogContents.confirmPermanentDeleteThread;
  const dialogData = {
    title: texts.title,
    contentType: 'PERMANENT_DELETE_THREAD',
    options: {
      cancelLabel: texts.cancelLabel,
      acceptLabel: texts.acceptLabel
    },
    sendTo: 'mailbox'
  };
  openDialogWindow(dialogData);
  ipcRenderer.once('selectedOption', (e, data) => {
    callback(data.selectedOption === texts.acceptLabel);
  });
};

export const reloadWindow = () => {
  getCurrentWindow().reload();
};

/*  News Client
----------------------------- */
export const getNews = ({ code }) => {
  return newsClient.getNews({ code });
};

/*  Criptext Client
----------------------------- */
export const changePassword = params => {
  return clientManager.changePassword(params);
};

export const changeRecoveryEmail = params => {
  return clientManager.changeRecoveryEmail(params);
};

export const deleteMyAccount = password => {
  return clientManager.deleteMyAccount(password);
};

export const getEmailBody = params => {
  return clientManager.getEmailBody(params);
};

export const getEvents = () => {
  return clientManager.getEvents();
};

export const getUserSettings = () => {
  return clientManager.getUserSettings();
};

export const logout = () => {
  return clientManager.logout();
};

export const postOpenEvent = params => {
  return clientManager.postOpenEvent(params);
};

export const removeDevice = params => {
  return clientManager.removeDevice(params);
};

export const resendConfirmationEmail = () => {
  return clientManager.resendConfirmationEmail();
};

export const postPeerEvent = params => {
  return clientManager.postPeerEvent(params);
};

export const resetPassword = recipientId => {
  return clientManager.resetPassword(recipientId);
};

export const setReadTracking = enabled => {
  return clientManager.setReadTracking(enabled);
};

export const setTwoFactorAuth = enable => {
  return clientManager.setTwoFactorAuth(enable);
};

export const unlockDevice = params => {
  return clientManager.unlockDevice(params);
};

export const updateNameEvent = params => {
  return clientManager.updateName(params);
};

export const unsendEmailEvent = metadataKey => {
  return clientManager.unsendEmail(metadataKey);
};

/*  DataBase
----------------------------- */
export const cleanDataLogout = async recipientId => {
  await dbManager.cleanDataLogout(recipientId);
  return dbManager.createSignalTables();
};

export const createLabel = params => {
  return dbManager.createLabel(params);
};

export const deleteEmailByKeys = key => {
  return dbManager.deleteEmailByKeys(key);
};

export const deleteEmailLabel = params => {
  return dbManager.deleteEmailLabel(params);
};

export const deleteFeedItemById = feedId => {
  return dbManager.deleteFeedItemById(feedId);
};

export const deleteLabelById = labelId => {
  return dbManager.deleteLabelById(labelId);
};

export const deleteEmailsByThreadIdAndLabelId = (threadIds, labelId) => {
  return dbManager.deleteEmailsByThreadIdAndLabelId(threadIds, labelId);
};

export const getAllFeedItems = () => {
  return dbManager.getAllFeedItems();
};

export const getAllLabels = () => {
  return dbManager.getAllLabels();
};

export const getContactByEmails = emails => {
  return dbManager.getContactByEmails(emails);
};

export const getContactByIds = ids => {
  return dbManager.getContactByIds(ids);
};

export const getEmailsByIds = emailIds => {
  return dbManager.getEmailsByIds(emailIds);
};

export const getEmailsByThreadIdAndLabelId = (threadIds, labelId) => {
  return dbManager.getEmailsByThreadIdAndLabelId(threadIds, labelId);
};

export const getEmailsByKeys = emailKeys => {
  return dbManager.getEmailsByKeys(emailKeys);
};

export const getEmailsByLabelIds = labelIds => {
  return dbManager.getEmailsByLabelIds(labelIds);
};

export const getEmailsByThreadId = threadId => {
  return dbManager.getEmailsByThreadId(threadId);
};

export const getEmailsCounterByLabelId = labelId => {
  return dbManager.getEmailsCounterByLabelId(labelId);
};

export const getEmailsGroupByThreadByParams = params => {
  return dbManager.getEmailsGroupByThreadByParams(params);
};

export const getEmailsUnredByLabelId = params => {
  return dbManager.getEmailsUnredByLabelId(params);
};

export const getEmailLabelsByEmailId = emailId => {
  return dbManager.getEmailLabelsByEmailId(emailId);
};

export const getFilesByTokens = tokens => {
  return dbManager.getFilesByTokens(tokens);
};

export const getLabelById = id => {
  return dbManager.getLabelById(id);
};

export const getLabelsByText = names => {
  return dbManager.getLabelsByText(names);
};

export const getTrashExpiredEmails = () => {
  return dbManager.getTrashExpiredEmails();
};

export const getUnreadEmailsByThreadId = threadId => {
  return dbManager.getUnreadEmailsByThreadId(threadId);
};

export const updateContactByEmail = ({ email, name }) => {
  return dbManager.updateContactByEmail({ email, name });
};

export const updateFeedItem = ({ feedItemId, seen }) => {
  return dbManager.updateFeedItem({ id: feedItemId, seen });
};

export const updateFilesByEmailId = ({ emailId, status }) => {
  return dbManager.updateFilesByEmailId({ emailId, status });
};

export const setMuteEmailById = (emailId, muteValue) => {
  return dbManager.updateEmail({ id: emailId, isMuted: muteValue });
};

export const setUnreadEmailById = (emailId, unreadValue) => {
  return dbManager.updateEmail({ id: emailId, unread: unreadValue });
};

export const updateEmails = params => {
  return dbManager.updateEmails(params);
};

export const updateAccount = params => {
  return dbManager.updateAccount(params);
};

export const updateLabel = params => {
  return dbManager.updateLabel(params);
};

export const updateOpenedEmailByKey = ({ key, status }) => {
  return dbManager.updateEmail({ key, status });
};

export const updateAppSettings = ({ opened, language, theme }) => {
  return dbManager.updateAppSettings({ opened, language, theme });
};

export const updateUnreadEmailByThreadIds = (threadIds, unread) => {
  return dbManager.updateUnreadEmailByThreadIds({ threadIds, unread });
};
