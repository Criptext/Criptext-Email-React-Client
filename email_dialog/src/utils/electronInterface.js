const electron = window.require('electron');
const { ipcRenderer, remote } = electron;
const globalManager = remote.require('./src/globalManager');

export const mySettings = remote.require('./src/Settings');
export const remoteData = globalManager.modalData.get();

/* Window events
   ----------------------------- */
export const onResponseDialog = (event, response, sendTo) => {
  ipcRenderer.send('response-dialog', response, sendTo);
};
