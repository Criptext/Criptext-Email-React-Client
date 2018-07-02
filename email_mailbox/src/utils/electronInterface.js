const electron = window.require('electron');
const { remote, ipcRenderer } = electron;
const dbManager = remote.require('./src/DBManager');
const clientManager = remote.require('./src/clientManager');
const labels = remote.require('./src/systemLabels');
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

/* Window events
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

export const editDraftInComposer = data => {
  ipcRenderer.send('edit-draft', data);
};

export const openEmailInComposer = data => {
  ipcRenderer.send('edit-draft', data);
};

export const openComposerWindow = () => {
  ipcRenderer.send('create-composer');
};

/* Criptext Client
   ----------------------------- */
export const acknowledgeEvents = eventIds => {
  return clientManager.acknowledgeEvents(eventIds);
};

export const getEmailBody = params => {
  return clientManager.getEmailBody(params);
};

export const getEvents = () => {
  return clientManager.getEvents();
};

export const postOpenEvent = params => {
  return clientManager.postOpenEvent(params);
};

/* DataBase
   ----------------------------- */
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

export const deleteEmailLabel = params => {
  return dbManager.deleteEmailLabel(params);
};

export const deleteFeedItemById = feedId => {
  return dbManager.deleteFeedItemById(feedId);
};

export const deletePreKeyPair = params => {
  return dbManager.deletePreKeyPair(params);
};

export const deleteSessionRecord = params => {
  return dbManager.deleteSessionRecord(params);
};

export const deleteEmailsByThreadId = threadIds => {
  return dbManager.deleteEmailsByThreadId(threadIds);
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

export const getEmailById = emailId => {
  return dbManager.getEmailById(emailId);
};

export const getEmailByKey = emailKey => {
  return dbManager.getEmailByKey(emailKey);
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

export const getIdentityKeyRecord = params => {
  return dbManager.getIdentityKeyRecord(params);
};

export const getLabelById = id => {
  return dbManager.getLabelById(id);
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

export const getThreads = (timestamp, params) => {
  return dbManager.getThreads(timestamp, params);
};

export const getUnreadEmailsByThreadId = threadId => {
  return dbManager.getUnreadEmailsByThreadId(threadId);
};

export const updateFeedItem = ({ feedItemId, seen }) => {
  return dbManager.updateFeedItem({ id: feedItemId, seen });
};

export const setMuteEmailById = (emailId, muteValue) => {
  return dbManager.updateEmail({ id: emailId, isMuted: muteValue });
};

export const setUnreadEmailById = (emailId, unreadValue) => {
  return dbManager.updateEmail({ id: emailId, unread: unreadValue });
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

export const updateUnreadEmailByThreadId = (threadId, value) => {
  return dbManager.updateEmailByThreadId({ threadId, unread: value });
};
