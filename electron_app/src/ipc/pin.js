const { ipcMain: ipc } = require('@criptext/electron-better-ipc');
const pinWindow = require('../windows/pin');
const globalManager = require('../globalManager');

ipc.answerRenderer('close-pin', () => {
  pinWindow.close();
  globalManager.pingData.set({});
});

ipc.answerRenderer('maximize-pin', () => {
  pinWindow.toggleMaximize();
});

ipc.answerRenderer('minimize-pin', () => {
  pinWindow.minimize();
});

ipc.answerRenderer('open-pin', params => {
  globalManager.pinData.set(params);
  pinWindow.show();
});

ipc.answerRenderer('send-pin', params => pinWindow.setUpPin(params));

ipc.answerRenderer('validate-pin', pin => pinWindow.validatePin(pin));
