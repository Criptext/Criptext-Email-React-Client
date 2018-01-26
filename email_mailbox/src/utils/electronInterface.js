const electron = window.require('electron');
const remote = electron.remote;
const dbManager = remote.require('./DBManager');
const ipcRenderer = electron.ipcRenderer;

export const openComposerWindow = () => {
  ipcRenderer.send('create-composer');
};

export const getThreads = (timestamp, params) => {
  return dbManager.getThreads(timestamp, params);
};

export const getAllLabels = () => {
  return dbManager.getAllLabels();
};

export const simpleThreadsFilter = filter => {
  return dbManager.simpleThreadsFilter(filter);
}

export const getThreadsFilter = (timestamp, params) => {
  return dbManager.getThreadsFilter(timestamp, params)
}