const electron = window.require('electron');
const { remote } = electron;

export const mySettings = remote.require('./src/Settings');
