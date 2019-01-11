import { labels } from './systemLabels';
import {
  cleanDataLogout as cleanData,
  createSignalTables,
  openDialogWindow
} from './ipc';

const electron = window.require('electron');
const { remote, ipcRenderer } = electron;
const { getCurrentWindow } = remote;
const clientManager = remote.require('./src/clientManager');
const newsClient = remote.require('./src/newsClient');
const dataTransferManager = remote.require('./src/dataTransferClient');

export const { requiredMinLength, requiredMaxLength } = remote.require(
  './src/validationConsts'
);

export const { FILE_SERVER_APP_ID, FILE_SERVER_KEY } = remote.require(
  './src/utils/const'
);

const additionalLabels = {
  search: {
    id: -1,
    text: 'Search'
  },
  allmail: {
    id: -1,
    text: 'All Mail'
  }
};
export const LabelType = Object.assign(labels, additionalLabels);
export const myAccount = remote.require('./src/Account');

const globalManager = remote.require('./src/globalManager');
export const setInternetConnectionStatus = status => {
  globalManager.internetConnection.setStatus(status);
};

export const mySettings = remote.require('./src/Settings');

export const errors = remote.require('./src/errors');

/*  Window events
----------------------------- */
export const confirmPermanentDeleteThread = callback => {
  // eslint-disable-next-line no-undef
  const string = require('./../lang');
  const texts = string.default.dialogContents.confirmPermanentDeleteThread;
  const dialogData = {
    title: texts.title,
    contentType: 'PERMANENT_DELETE_THREAD',
    options: {
      cancelLabel: texts.cancelLabel,
      acceptLabel: texts.acceptLabel
    },
    sendTo: 'mailbox'
  };
  openDialogWindow(dialogData);
  ipcRenderer.once('selectedOption', (e, data) => {
    callback(data.selectedOption === texts.acceptLabel);
  });
};

export const reloadWindow = () => {
  getCurrentWindow().reload();
};

/*  News Client
----------------------------- */
export const getNews = ({ code }) => {
  return newsClient.getNews({ code });
};

export const clearSyncData = () => {
  return dataTransferManager.clearSyncData();
};

export const decryptBackupFile = key => {
  return dataTransferManager.decrypt(key);
};

export const downloadBackupFile = address => {
  return dataTransferManager.download(address);
};

export const importDatabase = () => {
  return dataTransferManager.importDatabase();
};

/*  Criptext Client
----------------------------- */
export const setTwoFactorAuth = enable => {
  return clientManager.setTwoFactorAuth(enable);
};

export const syncAccept = randomId => {
  return clientManager.syncAccept(randomId);
};

export const syncBegin = () => {
  return clientManager.syncBegin();
};

export const syncDeny = randomId => {
  return clientManager.syncDeny(randomId);
};

export const syncStatus = () => {
  return clientManager.syncStatus();
};

export const unlockDevice = params => {
  return clientManager.unlockDevice(params);
};

export const updateNameEvent = params => {
  return clientManager.updateName(params);
};

export const unsendEmailEvent = metadataKey => {
  return clientManager.unsendEmail(metadataKey);
};

/*  DataBase
----------------------------- */
export const cleanDataLogout = async recipientId => {
  await cleanData(recipientId);
  return createSignalTables();
};
