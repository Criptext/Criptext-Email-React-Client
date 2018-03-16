const electron = window.require('electron');
const { ipcRenderer, remote } = electron;
const dbManager = remote.require('./src/DBManager');

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
