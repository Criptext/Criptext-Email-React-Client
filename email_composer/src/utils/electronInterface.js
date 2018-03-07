const electron = window.require('electron');
const remote = electron.remote;
const dbManager = remote.require('./src/DBManager');

export const createSignalstore = params => {
  return dbManager.createSignalstore(params);
};

export const createKeys = params => {
  return dbManager.createKeys(params);
};

export const getKeys = params => {
  return dbManager.getKeys(params);
};

export const getIdentityKeyPair = params => {
  return dbManager.getIdentityKeyPair(params);
};

export const getRegistrationId = params => {
  return dbManager.getRegistrationId(params);
};

export const getPreKeyPair = params => {
  return dbManager.getPreKeyPair(params);
};

export const getSignedPreKey = params => {
  return dbManager.getSignedPreKey(params);
};

export const createSession = params => {
  return dbManager.createSession(params);
};

export const getKeyserverToken = () => {
  return dbManager.getKeyserverToken();
};
