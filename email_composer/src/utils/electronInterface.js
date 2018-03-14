const electron = window.require('electron');
const remote = electron.remote;
const dbManager = remote.require('./src/DBManager');
const ipcRenderer = electron.ipcRenderer;

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
