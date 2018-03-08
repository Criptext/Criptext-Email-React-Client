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
export const getRegistrationId = params => {
  return dbManager.getRegistrationId(params);
};

export const getKeyserverToken = () => {
  return dbManager.getKeyserverToken();
};

export const createKeys = params => {
  return dbManager.createKeys(params);
};

export const getPreKeyPair = params => {
  return dbManager.getPreKeyPair(params);
};

export const getSignedPreKey = params => {
  return dbManager.getSignedPreKey(params);
};

export const createSignalstore = params => {
  return dbManager.createSignalstore(params);
};

export const getIdentityKeyPair = params => {
  return dbManager.getIdentityKeyPair(params);
};
