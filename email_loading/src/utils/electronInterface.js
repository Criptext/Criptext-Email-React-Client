const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

export const closeLoading = () => {
  ipcRenderer.send('close-loading');
};

export const openMailbox = () => {
  ipcRenderer.send('open-mailbox');
};

window.setTimeout(() => {
  openMailbox();
  closeLoading();
}, 3000);
