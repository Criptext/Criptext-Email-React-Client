import { labels } from './systemLabels';
import {
  cleanDataLogout as cleanData,
  createSignalTables,
  updatePushToken
} from './ipc';

const electron = window.require('electron');
const { remote, ipcRenderer } = electron;
const { getCurrentWindow } = remote;
const newsClient = remote.require('./src/newsClient');
const {
  START_NOTIFICATION_SERVICE,
  NOTIFICATION_RECEIVED,
  TOKEN_UPDATED
} = remote.require('electron-push-receiver/src/constants');
const senderNotificationId = '73243261136';

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

/*  Firebase
----------------------------- */
ipcRenderer.on(TOKEN_UPDATED, async (_, token) => {
  await updatePushToken(token);
});

ipcRenderer.on(NOTIFICATION_RECEIVED, (_, notificationPayload) => {
  const EventEmitter = window.require('events');
  const emitter = new EventEmitter();
  const LOAD_EVENTS = 'load-events';
  emitter.emit(LOAD_EVENTS, notificationPayload);
});

ipcRenderer.send(START_NOTIFICATION_SERVICE, senderNotificationId);
