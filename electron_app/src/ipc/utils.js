const ipc = require('@criptext/electron-better-ipc');
const { getComputerName, isWindows } = require('../utils/osUtils');

ipc.answerRenderer('get-computer-name', () => getComputerName());
ipc.answerRenderer('get-isWindows', () => isWindows());
