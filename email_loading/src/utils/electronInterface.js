import { labels } from './systemLabels';
const { remote } = window.require('electron');
const socketManager = remote.require('./src/socketClient');
const globalManager = remote.require('./src/globalManager');

export const myAccount = remote.require('./src/Account');

export const mySettings = remote.require('./src/Settings');
export const getAlicePort = remote.require('./src/aliceManager').getPort;

export const LabelType = labels;

export const { loadingType, remoteData, shouldResetPIN } = remote.getGlobal(
  'loadingData'
);

export const getMailboxGettingEventsStatus = () => {
  return globalManager.isGettingEvents.get();
};

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

export const setPendingRestoreStatus = status => {
  globalManager.pendingRestore.set(status);
};
