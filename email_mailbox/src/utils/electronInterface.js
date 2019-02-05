import { labels } from './systemLabels';
import { cleanDataLogout as cleanData, createSignalTables } from './ipc';

const electron = window.require('electron');
const { remote } = electron;
const { getCurrentWindow } = remote;
const newsClient = remote.require('./src/newsClient');

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

/*  Window events
----------------------------- */
export const reloadWindow = () => {
  getCurrentWindow().reload();
};

/*  News Client
----------------------------- */
export const getNews = ({ code }) => {
  return newsClient.getNews({ code });
};

/*  DataBase
----------------------------- */
export const cleanDataLogout = async recipientId => {
  await cleanData(recipientId);
  return createSignalTables();
};
