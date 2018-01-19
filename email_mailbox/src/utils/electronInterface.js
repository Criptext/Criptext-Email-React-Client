const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;

export const openComposerWindow = () => {
  ipcRenderer.send('create-composer')
}