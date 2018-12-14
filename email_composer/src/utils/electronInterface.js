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
export const mySettings = remote.require('./src/Settings');

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
