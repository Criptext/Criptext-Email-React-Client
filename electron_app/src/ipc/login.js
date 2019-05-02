const ipc = require('@criptext/electron-better-ipc');
const {close, minimize, show} = require('../windows/login');

ipc.answerRenderer('close-login', () => {
  close();
});

ipc.answerRenderer('minimize-login', () => {
  minimize();
});

ipc.answerRenderer('open-login', params => {
  show(params);
});
