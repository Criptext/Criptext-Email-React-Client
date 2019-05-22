import { labels } from './systemLabels';
import { cleanDataLogout as cleanData } from './ipc';

const { remote } = window.require('electron');
const { getCurrentWindow } = remote;

const newsClient = remote.require('./src/newsClient');
const globalManager = remote.require('./src/globalManager');

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

export const setInternetConnectionStatus = status => {
  globalManager.internetConnection.setStatus(status);
};

export const getDeviceType = () => globalManager.deviceType.id;

/*  Window events
----------------------------- */
export const reloadWindow = () => {
  getCurrentWindow().reload();
};

export const checkDisableRequests = () => {
  return globalManager.windowsEvents.checkDisabled();
};

export const disableEventRequests = () => {
  globalManager.windowsEvents.disable();
};

export const enableEventRequests = () => {
  globalManager.windowsEvents.enable();
};

export const getGettingEventsStatus = () => {
  return globalManager.isGettingEvents.get();
};

export const setGettingEventsStatus = value => {
  globalManager.isGettingEvents.set(value);
};

/*  News Client
----------------------------- */
export const getNews = ({ code }) => {
  return newsClient.getNews({ code });
};

/*  DataBase
----------------------------- */
export const cleanDataLogout = async ({ recipientId }) => {
  return await cleanData({ recipientId });
};
