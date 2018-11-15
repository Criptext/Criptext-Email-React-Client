import { labels } from './systemLabels';
const electron = window.require('electron');
const { remote, ipcRenderer } = electron;
const dbManager = remote.require('./src/DBManager');
const clientManager = remote.require('./src/clientManager');

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
export const composerEvents = remote.require('./src/windows/composer')
  .composerEvents;

const globalManager = remote.require('./src/globalManager');
export const setInternetConnectionStatus = status => {
  globalManager.internetConnection.setStatus(status);
};

/*  Window events
----------------------------- */
export const closeDialog = () => {
  ipcRenderer.send('close-modal');
};

export const confirmPermanentDeleteThread = callback => {
  const dataForModal = {
    title: 'Warning!',
    contentType: 'PERMANENT_DELETE_THREAD',
    options: {
      cancelLabel: 'Cancel',
      acceptLabel: 'Confirm'
    },
    sendTo: 'mailbox'
  };
  ipcRenderer.send('open-modal', dataForModal);
  ipcRenderer.once('selectedOption', (event, data) => {
    callback(data.selectedOption);
  });
};

export const downloadUpdate = () => {
  ipcRenderer.send('download-update');
};

export const editDraftInComposer = data => {
  ipcRenderer.send('edit-draft', data);
};

export const logoutApp = () => {
  ipcRenderer.send('logout-app');
};

export const openEmailInComposer = data => {
  ipcRenderer.send('edit-draft', data);
};

export const openComposerWindow = () => {
  ipcRenderer.send('create-composer');
};

export const openCreateKeys = params => {
  ipcRenderer.send('open-create-keys', params);
};

export const throwError = error => {
  ipcRenderer.send('throwError', error);
};

export const updateDockBadge = value => {
  ipcRenderer.send('update-dock-badge', value);
};

export const minimizeMailbox = () => {
  ipcRenderer.send('minimize-mailbox');
};

export const maximizeMailbox = () => {
  ipcRenderer.send('toggle-maximize-mailbox');
};

export const closeMailbox = () => {
  ipcRenderer.send('close-mailbox');
};

/*  Criptext Client
----------------------------- */
export const acknowledgeEvents = eventIds => {
  return clientManager.acknowledgeEvents(eventIds);
};

export const changePassword = params => {
  return clientManager.changePassword(params);
};

export const changeRecoveryEmail = params => {
  return clientManager.changeRecoveryEmail(params);
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
export const cleanDatabase = async () => {
  await dbManager.cleanDataBase();
};

export const cleanDataLogout = async recipientId => {
  await dbManager.cleanDataLogout(recipientId);
  return dbManager.createSignalTables();
};

export const createAccount = params => {
  return dbManager.createAccount(params);
};

export const createEmail = params => {
  return dbManager.createEmail(params);
};

export const createEmailLabel = params => {
  return dbManager.createEmailLabel(params);
};

export const createFeedItem = params => {
  return dbManager.createFeedItem(params);
};

export const createFileKey = params => {
  return dbManager.createFileKey(params);
};

export const createIdentityKeyRecord = params => {
  return dbManager.createIdentityKeyRecord(params);
};

export const createLabel = params => {
  return dbManager.createLabel(params);
};

export const createPreKeyRecord = params => {
  return dbManager.createPreKeyRecord(params);
};

export const createSessionRecord = params => {
  return dbManager.createSessionRecord(params);
};

export const createSignedPreKeyRecord = params => {
  return dbManager.createSignedPreKeyRecord(params);
};

export const deleteEmailsByIds = ids => {
  return dbManager.deleteEmailsByIds(ids);
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

export const deletePreKeyPair = params => {
  return dbManager.deletePreKeyPair(params);
};

export const deleteSessionRecord = params => {
  return dbManager.deleteSessionRecord(params);
};

export const deleteEmailsByThreadIdAndLabelId = (threadIds, labelId) => {
  return dbManager.deleteEmailsByThreadIdAndLabelId(threadIds, labelId);
};

export const getAccount = () => {
  return dbManager.getAccount();
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

export const getEmailByKey = emailKey => {
  return dbManager.getEmailByKey(emailKey);
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

export const getFilesByEmailId = emailId => {
  return dbManager.getFilesByEmailId(emailId);
};

export const getFilesByTokens = tokens => {
  return dbManager.getFilesByTokens(tokens);
};

export const getFileKeyByEmailId = emailId => {
  return dbManager.getFileKeyByEmailId(emailId);
};

export const getIdentityKeyRecord = params => {
  return dbManager.getIdentityKeyRecord(params);
};

export const getLabelById = id => {
  return dbManager.getLabelById(id);
};

export const getLabelsByText = names => {
  return dbManager.getLabelsByText(names);
};

export const getPreKeyPair = params => {
  return dbManager.getPreKeyPair(params);
};

export const getSessionRecord = params => {
  return dbManager.getSessionRecord(params);
};

export const getSignedPreKey = params => {
  return dbManager.getSignedPreKey(params);
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

export const updateEmail = params => {
  return dbManager.updateEmail(params);
};

export const updateEmails = params => {
  return dbManager.updateEmails(params);
};

export const updateAccount = params => {
  return dbManager.updateAccount(params);
};

export const updateIdentityKeyRecord = params => {
  return dbManager.updateIdentityKeyRecord(params);
};

export const updateLabel = params => {
  return dbManager.updateLabel(params);
};

export const updateOpenedEmailByKey = ({ key, status }) => {
  return dbManager.updateEmail({ key, status });
};

export const updateUnreadEmailByThreadIds = (threadIds, unread) => {
  return dbManager.updateUnreadEmailByThreadIds({ threadIds, unread });
};
