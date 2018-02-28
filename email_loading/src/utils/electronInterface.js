const electron = window.require('electron');
const { ipcRenderer } = electron;

export const remoteData = electron.remote.getGlobal('loadingData');

export const closeCreatingKeys = () => {
  ipcRenderer.send('close-create-keys');
};

export const openMailbox = () => {
  ipcRenderer.send('open-mailbox');
};
