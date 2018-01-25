const electron = window.require('electron');
const remote = electron.remote;
const dbManager = remote.require('./DBManager');
const ipcRenderer = electron.ipcRenderer;

export const openComposerWindow = () => {
  ipcRenderer.send('create-composer');
};

export const getThreads = timestamp => {
  return dbManager.getThreads(timestamp);
};

export const getAllLabels = () => {
  return dbManager.getAllLabels();
};
