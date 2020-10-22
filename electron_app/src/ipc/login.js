const { ipcMain: ipc } = require('@criptext/electron-better-ipc');
const loginWindow = require('../windows/login');
const globalManager = require('../globalManager');
const { checkForUpdates } = require('./../updater');
const { openUpgradeToPlusWindow } = require('../windows/upgradePlus');

ipc.answerRenderer('close-login', ({ forceClose }) => {
  loginWindow.close({ forceClose });
});

ipc.answerRenderer('minimize-login', () => {
  loginWindow.minimize();
});

ipc.answerRenderer('open-login', params => {
  if (params) globalManager.loginData.set(params);
  loginWindow.show();
});

ipc.answerRenderer('check-for-updates', showDialog => {
  checkForUpdates(showDialog);
});

ipc.answerRenderer('upgrade-to-plus', token => {
  openUpgradeToPlusWindow(token);
});
