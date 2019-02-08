const ipc = require('@criptext/electron-better-ipc');
const dataTransferManager = require('../dataTransferClient');

ipc.answerRenderer('data-transfer-clear-sync-data', () =>
  dataTransferManager.clearSyncData()
);

ipc.answerRenderer('data-transfer-download', address =>
  dataTransferManager.download(address)
);

ipc.answerRenderer('data-transfer-decrypt', key =>
  dataTransferManager.decrypt(key)
);

ipc.answerRenderer('data-transfer-encrypt', () =>
  dataTransferManager.encrypt()
);

ipc.answerRenderer('data-transfer-export-database', () =>
  dataTransferManager.exportDatabase()
);

ipc.answerRenderer('data-transfer-import', () =>
  dataTransferManager.importDatabase()
);

ipc.answerRenderer('data-transfer-upload', randomId =>
  dataTransferManager.upload(randomId)
);
