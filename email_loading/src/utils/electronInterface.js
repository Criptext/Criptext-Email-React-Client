const electron = window.require('electron');
const { ipcRenderer, remote } = electron;
const dbManager = remote.require('./src/DBManager');
const clientManager = remote.require('./src/clientManager');

export const errors = remote.require('./src/errors');

export const myAccount = remote.require('./src/Account');

export const LabelType = remote.require('./src/systemLabels');

export const remoteData = remote.getGlobal('loadingData');

export const closeCreatingKeys = () => {
  ipcRenderer.send('close-create-keys');
};

export const createSession = params => {
  return dbManager.createSession(params);
};

export const openMailbox = () => {
  ipcRenderer.send('open-mailbox');
};

export const throwError = error => {
  ipcRenderer.send('throwError', error);
};

/* Signal
  ----------------------------- */
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

export const createAccount = params => {
  return dbManager.createAccount(params);
};

export const getAccount = () => {
  return dbManager.getAccount();
};

export const postUser = params => {
  return clientManager.postUser(params);
};

export const createLabel = params => {
  return dbManager.createLabel(params);
};
