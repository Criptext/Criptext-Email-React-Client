import { labels } from './systemLabels';
const { remote } = window.require('electron');
const socketManager = remote.require('./src/socketClient');
const globalManager = remote.require('./src/globalManager');

export const myAccount = remote.require('./src/Account');

export const mySettings = remote.require('./src/Settings');

export const LabelType = labels;

export const { loadingType, remoteData } = remote.getGlobal('loadingData');

export const setRemoteData = data => {
  globalManager.loadingData.set(data);
};

export const startSocket = jwt => {
  const data = jwt ? { jwt } : myAccount;
  socketManager.start(data);
};

export const stopSocket = () => {
  return socketManager.disconnect();
};

export const isFromStore =
  globalManager.isWindowsStore.get() || globalManager.isMAS.get();
