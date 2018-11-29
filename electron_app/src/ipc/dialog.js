const ipc = require('@criptext/electron-better-ipc');
const dialogWindow = require('../windows/dialog');

ipc.answerRenderer('close-dialog', () => {
  dialogWindow.close();
});
