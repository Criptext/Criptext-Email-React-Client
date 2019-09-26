const { ipcMain: ipc } = require('@criptext/electron-better-ipc');
const pinWindow = require('../windows/pin');

ipc.answerRenderer('close-pin', () => {
  pinWindow.close();
});

ipc.answerRenderer('maximize-pin', () => {
  pinWindow.toggleMaximize();
});

ipc.answerRenderer('minimize-pin', () => {
  pinWindow.minimize();
});

ipc.answerRenderer('send-pin', params => {
  pinWindow.validatePin(params);
});
