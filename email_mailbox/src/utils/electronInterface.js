import { labels } from './systemLabels';

const { remote } = window.require('electron');
const { getCurrentWindow, dialog } = remote;

const newsClient = remote.require('./src/newsClient');
const globalManager = remote.require('./src/globalManager');
export const getAlicePort = remote.require('./src/aliceManager').getPort;
export const getAlicePassword = remote.require('./src/aliceManager')
  .getPassword;

export const myAccount = remote.require('./src/Account');
export const mySettings = remote.require('./src/Settings');
export const { requiredMinLength, requiredMaxLength } = remote.require(
  './src/validationConsts'
);

export const { FILE_SERVER_APP_ID, FILE_SERVER_KEY } = remote.require(
  './src/utils/const'
);

const additionalLabels = {
  search: {
    id: -2,
    text: 'Search'
  },
  allmail: {
    id: -1,
    text: 'All Mail'
  }
};
export const LabelType = Object.assign(labels, additionalLabels);

export const getDeviceType = () => globalManager.deviceType.id;

export const setPendingRestoreStatus = status => {
  globalManager.pendingRestore.set(status);
};

export const getPendingRestoreStatus = () => {
  return globalManager.pendingRestore.get();
};

export const getBackupStatus = () => {
  return globalManager.backupStatus.get();
};

export const getTokenByRecipientId = (recipientId, domain) => {
  return myAccount.loggedAccounts.find(
    account =>
      account.recipientId === recipientId ||
      account.recipientId === `${recipientId}@${domain}`
  ).jwt;
};

/*  Window events
----------------------------- */
export const reloadWindow = () => {
  getCurrentWindow().reload();
};

export const showSaveFileDialog = fileName => {
  return dialog.showSaveDialog(null, { defaultPath: fileName });
};

/*  News Client
----------------------------- */
export const getNews = ({ code }) => {
  return newsClient.getNews({ code });
};
