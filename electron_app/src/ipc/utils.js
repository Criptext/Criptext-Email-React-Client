const ipc = require('@criptext/electron-better-ipc');
const { dialog } = require('electron');
const { getComputerName, isWindows } = require('../utils/osUtils');

ipc.answerRenderer('get-computer-name', () => getComputerName());
ipc.answerRenderer('get-isWindows', () => isWindows());
ipc.answerRenderer('throwError', ({ name, description }) => {
  dialog.showErrorBox(name, description);
});
