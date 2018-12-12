import { labels } from './systemLabels';
const electron = window.require('electron');
const { remote, ipcRenderer } = electron;
const composerId = remote.getCurrentWindow().id;
const dbManager = remote.require('./src/DBManager');
const clientManager = remote.require('./src/clientManager');
const globalManager = remote.require('./src/globalManager');

export const { FILE_SERVER_APP_ID, FILE_SERVER_KEY } = remote.require(
  './src/utils/const'
);

export const getEmailToEdit = () => {
  return globalManager.emailToEdit.get(composerId);
};

export const getContactsByEmailId = emailId => {
  return dbManager.getContactsByEmailId(emailId);
};

export const objectUtils = remote.require('./src/utils/ObjectUtils');

export const errors = remote.require('./src/errors');

export const myAccount = remote.require('./src/Account');

export const LabelType = labels;

/* Window events
   ----------------------------- */
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

export const deletePreKeyPair = params => {
  return dbManager.deletePreKeyPair(params);
};

export const deleteSessionRecord = params => {
  return dbManager.deleteSessionRecord(params);
};

export const getAccount = () => {
  return dbManager.getAccount();
};

export const getEmailByKey = key => {
  return dbManager.getEmailByKey(key);
};

export const getFilesByEmailId = emailId => {
  return dbManager.getFilesByEmailId(emailId);
};

export const getFileKeyByEmailId = emailId => {
  return dbManager.getFileKeyByEmailId(emailId);
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
