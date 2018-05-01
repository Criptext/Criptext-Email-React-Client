const electron = window.require('electron');
const { remote, ipcRenderer } = electron;
const dbManager = remote.require('./src/DBManager');
const clientManager = remote.require('./src/clientManager');

const globalManager = remote.require('./src/globalManager');

export const getEmailToEdit = () => {
  return globalManager.emailToEdit.get();
};

export const getContactsByEmailId = emailId => {
  return dbManager.getContactsByEmailId(emailId);
};

export const composerEvents = remote.require('./src/windows/composer')
  .composerEvents;

export const errors = remote.require('./src/errors');

export const myAccount = remote.require('./src/Account');

export const LabelType = remote.require('./src/systemLabels');

export const closeComposerWindow = () => {
  ipcRenderer.send('close-composer');
};

export const createAccount = params => {
  return dbManager.createAccount(params);
};

export const createEmail = params => {
  return dbManager.createEmail(params);
};

export const createKeys = params => {
  return dbManager.createKeys(params);
};

export const getKeys = params => {
  return dbManager.getKeys(params);
};

export const getPreKeyPair = params => {
  return dbManager.getPreKeyPair(params);
};

export const getSignedPreKey = params => {
  return dbManager.getSignedPreKey(params);
};

export const getAccount = () => {
  return dbManager.getAccount();
};

export const updateEmail = params => {
  return dbManager.updateEmail(params);
};

export const findKeyBundles = params => {
  return clientManager.findKeyBundles(params);
};

export const postEmail = params => {
  return clientManager.postEmail(params);
};

export const updateEmailLabel = params => {
  return dbManager.updateEmailLabel(params);
};

export const throwError = error => {
  ipcRenderer.send('throwError', error);
};

export const saveDraftChanges = data => {
  ipcRenderer.send('save-draft-changes', data);
};

export const getAllContacts = () => {
  return dbManager.getAllContacts();
};

export const deleteEmailById = id => {
  return dbManager.deleteEmail(id);
};

export const deleteEmailByKey = key => {
  return dbManager.deleteEmail(key);
};

export const getEmailByKey = key => {
  return dbManager.getEmailByKey(key);
};

export const createEmailLabel = params => {
  return dbManager.createEmailLabel(params);
};
