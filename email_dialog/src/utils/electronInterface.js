const electron = window.require('electron');
const { ipcRenderer } = electron;

export const onResponseModal = (event, response) => {
  ipcRenderer.send('response-modal', response);
};
