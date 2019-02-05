const ipc = require('@criptext/electron-better-ipc');
const dataTransferManager = require('../dataTransferClient');

ipc.answerRenderer('data-transfer-download', address =>
  dataTransferManager.download(address)
);

ipc.answerRenderer('data-transfer-decrypt', key =>
  dataTransferManager.decrypt(key)
);