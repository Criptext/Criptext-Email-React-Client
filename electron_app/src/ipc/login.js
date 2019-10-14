const ipc = require('@criptext/electron-better-ipc');
const loginWindow = require('../windows/login');

ipc.answerRenderer('close-login', ({ forceClose }) => {
  loginWindow.close({ forceClose });
});

ipc.answerRenderer('minimize-login', () => {
  loginWindow.minimize();
});
