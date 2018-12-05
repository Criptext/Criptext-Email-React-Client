const ipc = require('@criptext/electron-better-ipc');
const loginWindow = require('../windows/login');

ipc.answerRenderer('close-login', () => {
  loginWindow.close();
});

ipc.answerRenderer('minimize-login', () => {
  loginWindow.minimize();
});
