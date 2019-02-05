const ipc = require('@criptext/electron-better-ipc');
const dataTransferManager = require('../dataTransferClient');

ipc.answerRenderer('data-transfer-download', address =>
  dataTransferManager.download(address)
);
