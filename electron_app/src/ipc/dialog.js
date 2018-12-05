const ipc = require('@criptext/electron-better-ipc');
const dialogWindow = require('../windows/dialog');
const globalManager = require('../globalManager');

ipc.answerRenderer('close-dialog', () => {
  dialogWindow.close();
});

ipc.answerRenderer('open-dialog', data => {
  globalManager.modalData.set(data);
  dialogWindow.show();
});
