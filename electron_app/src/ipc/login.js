const { ipcMain: ipc } = require('@criptext/electron-better-ipc');
const loginWindow = require('../windows/login');
const { checkForUpdates } = require('./../updater');

ipc.answerRenderer('close-login', ({ forceClose }) => {
  loginWindow.close({ forceClose });
});

ipc.answerRenderer('minimize-login', () => {
  loginWindow.minimize();
});

ipc.answerRenderer('open-login', () => {
  loginWindow.show();
});

ipc.answerRenderer('check-for-updates', showDialog => {
  checkForUpdates(showDialog);
});
