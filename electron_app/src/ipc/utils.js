const ipc = require('@criptext/electron-better-ipc');
const { getComputerName } = require('../utils/osUtils');

ipc.answerRenderer('get-computer-name', () => getComputerName());
