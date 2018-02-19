const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;
const remote = electron.remote;
const dbManager = remote.require('./src/DBManager');

export const closeLogin = () => {
  ipcRenderer.send('close-login');
};

export const resizeSignUp = () => {
  ipcRenderer.send('resizeSignUp');
};

export const resizeLogin = () => {
  ipcRenderer.send('resizeLogin');
};

export const showDialog = callback => {
  ipcRenderer.send('open-modal');
  ipcRenderer.once('selectedOption', (event, data) => {
    callback(data.selectedOption);
  });
};

export const closeDialog = () => {
  ipcRenderer.send('close-modal');
};

export const openLoading = () => {
  ipcRenderer.send('open-loading');
};

export const closeLoading = () => {
  ipcRenderer.send('close-loading');
};

export const openMailbox = () => {
  ipcRenderer.send('open-mailbox');
};

export const createUser = params => {
  return dbManager.createUser(params);
};
