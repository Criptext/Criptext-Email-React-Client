const electron = window.require('electron');
const { ipcRenderer, remote } = electron;
const dbManager = remote.require('./src/DBManager');
const clientManager = remote.require('./src/clientManager');

export const errors = remote.require('./src/errors');

export const myAccount = remote.require('./src/Account');

export const LabelType = remote.require('./src/systemLabels');

export const { loadingType, remoteData } = remote.getGlobal('loadingData');

/* Window events
   ----------------------------- */
export const closeCreatingKeys = () => {
  ipcRenderer.send('close-create-keys');
};

export const openMailbox = () => {
  ipcRenderer.send('open-mailbox');
};

export const throwError = error => {
  ipcRenderer.send('throwError', error);
};

/* Criptext Client
  ----------------------------- */
export const postUser = params => {
  return clientManager.postUser(params);
};

/* DataBase
  ----------------------------- */
export const cleanDataBase = params => {
  return dbManager.cleanDataBase(params);
};

export const createAccount = params => {
  return dbManager.createAccount(params);
};

export const createContact = params => {
  return dbManager.createContact(params);
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

export const createTables = () => {
  return dbManager.createTables();
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

export const getIdentityKeyRecord = params => {
  return dbManager.getIdentityKeyRecord(params);
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

export const postKeyBundle = params => {
  return clientManager.postKeyBundle(params);
};

export const updateAccount = params => {
  return dbManager.updateAccount(params);
};

export const updateIdentityKeyRecord = params => {
  return dbManager.updateIdentityKeyRecord(params);
};
