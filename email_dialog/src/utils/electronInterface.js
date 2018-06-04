const electron = window.require('electron');
const { ipcRenderer, remote } = electron;
const globalManager = remote.require('./src/globalManager');

export const remoteData = globalManager.modalData.get();

/* Window events
   ----------------------------- */
export const onResponseModal = (event, response, sendTo) => {
  ipcRenderer.send('response-modal', response, sendTo);
};
