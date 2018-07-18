const electron = window.require('electron');
const { remote, ipcRenderer } = electron;
const composerId = remote.getCurrentWindow().id;
const dbManager = remote.require('./src/DBManager');
const clientManager = remote.require('./src/clientManager');
const globalManager = remote.require('./src/globalManager');

export const { FILE_SERVER_APP_ID, FILE_SERVER_KEY } = remote.require(
  './src/utils/consts'
);

export const getEmailToEdit = () => {
  return globalManager.emailToEdit.get(composerId);
};

export const getContactsByEmailId = emailId => {
  return dbManager.getContactsByEmailId(emailId);
};

export const composerEvents = remote.require('./src/windows/composer')
  .composerEvents;

export const objectUtils = remote.require('./src/utils/ObjectUtils');

export const errors = remote.require('./src/errors');

export const myAccount = remote.require('./src/Account');

export const LabelType = remote.require('./src/systemLabels');

/* Window events
   ----------------------------- */
export const closeComposerWindow = optionalEmailId => {
  ipcRenderer.send('close-composer', { composerId, emailId: optionalEmailId });
};

export const saveDraftChanges = data => {
  ipcRenderer.send('save-draft-changes', { composerId, data });
};

export const throwError = error => {
  ipcRenderer.send('throwError', error);
};

export const sendEventToMailbox = (name, params) => {
  ipcRenderer.send(name, params);
};

/* Criptext Client
   ----------------------------- */
export const findKeyBundles = params => {
  return clientManager.findKeyBundles(params);
};

export const postEmail = params => {
  return clientManager.postEmail(params);
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

export const createFile = params => {
  return dbManager.createFile(params);
};

export const createIdentityKeyRecord = params => {
  return dbManager.createIdentityKeyRecord(params);
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

export const deleteEmailByKey = key => {
  return dbManager.deleteEmailByKey(key);
};

export const deletePreKeyPair = params => {
  return dbManager.deletePreKeyPair(params);
};

export const deleteSessionRecord = params => {
  return dbManager.deleteSessionRecord(params);
};

export const getAccount = () => {
  return dbManager.getAccount();
};

export const getAllContacts = () => {
  return dbManager.getAllContacts();
};

export const getEmailByKey = key => {
  return dbManager.getEmailByKey(key);
};

export const getIdentityKeyRecord = params => {
  return dbManager.getIdentityKeyRecord(params);
};

export const getSessionRecord = params => {
  return dbManager.getSessionRecord(params);
};

export const getSessionRecordByRecipientIds = recipientIds => {
  return dbManager.getSessionRecordByRecipientIds(recipientIds);
};

export const getPreKeyPair = params => {
  return dbManager.getPreKeyPair(params);
};

export const getSignedPreKey = params => {
  return dbManager.getSignedPreKey(params);
};

export const updateEmail = params => {
  return dbManager.updateEmail(params);
};

export const updateEmailLabel = params => {
  return dbManager.updateEmailLabel(params);
};

export const updateIdentityKeyRecord = params => {
  return dbManager.updateIdentityKeyRecord(params);
};
