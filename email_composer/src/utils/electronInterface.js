import { labels } from './systemLabels';
const electron = window.require('electron');
const { remote, ipcRenderer } = electron;
const composerId = remote.getCurrentWindow().id;
const globalManager = remote.require('./src/globalManager');

export const { FILE_SERVER_APP_ID, FILE_SERVER_KEY } = remote.require(
  './src/utils/const'
);

export const getEmailToEdit = () => {
  return globalManager.emailToEdit.get(composerId);
};

export const myAccount = remote.require('./src/Account');
export const mySettings = remote.require('./src/Settings');
export const LabelType = labels;

/*  Window events
----------------------------- */
export const sendEventToMailbox = (name, params) => {
  ipcRenderer.send(name, params);
};

export const disableEventRequests = () => {
  globalManager.windowsEvents.disable();
};
