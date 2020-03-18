const { remote } = window.require('electron');
const globalManager = remote.require('./src/globalManager');
const { DEFAULT_PIN } = remote.require('./src/utils/const');

export const mySettings = remote.require('./src/Settings');
export const { pinType, remoteData } = remote.getGlobal('pinData');
export const getPin = () => {
  const globalPin = globalManager.databaseKey.get();
  if (globalPin === DEFAULT_PIN) {
    return '';
  }
};
export const getProgressDBE = () => globalManager.progressDBE.get();
