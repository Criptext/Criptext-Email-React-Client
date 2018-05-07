const electron = window.require('electron');
const { ipcRenderer } = electron;

export const remoteData = electron.remote.getGlobal('modalData');

/* Window events
   ----------------------------- */
export const onResponseModal = (event, response) => {
  ipcRenderer.send('response-modal', response);
};
