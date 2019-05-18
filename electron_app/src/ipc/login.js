const ipc = require('@criptext/electron-better-ipc');
const { close, exit, minimize, show } = require('../windows/login');

ipc.answerRenderer('close-login', isExit => {
  if (isExit) exit(isExit);
  close();
});

ipc.answerRenderer('minimize-login', () => {
  minimize();
});

ipc.answerRenderer('open-login', params => {
  show(params);
});
