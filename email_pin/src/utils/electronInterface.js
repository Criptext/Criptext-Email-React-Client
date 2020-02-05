const { remote } = window.require('electron');
const globalManager = remote.require('./src/globalManager');

export const mySettings = remote.require('./src/Settings');
export const { pinType, remoteData } = remote.getGlobal('pinData');
export const getPin = () => globalManager.databaseKey.get();
export const getProgressDBE = () => globalManager.progressDBE.get();
