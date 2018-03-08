const electron = window.require('electron');
const remote = electron.remote;
const dbManager = remote.require('./src/DBManager');

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
