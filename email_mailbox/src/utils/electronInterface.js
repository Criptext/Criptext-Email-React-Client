import { labels } from './systemLabels';
import { cleanDataLogout as cleanData, createSignalTables } from './ipc';

const { remote } = window.require('electron');
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
    id: -2,
    text: 'Search'
  },
  allmail: {
    id: -1,
    text: 'All Mail'
  }
};
export const LabelType = Object.assign(labels, additionalLabels);
export const myAccount = remote.require('./src/Account');

export const setInternetConnectionStatus = status => {
  const globalManager = remote.require('./src/globalManager');
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
