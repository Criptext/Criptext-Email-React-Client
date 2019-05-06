const ipc = require('@criptext/electron-better-ipc');
const dataTransferManager = require('../dataTransferClient');

ipc.answerRenderer('data-transfer-clear-sync-data', () =>
  dataTransferManager.clearSyncData()
);

ipc.answerRenderer('data-transfer-decrypt', key =>
  dataTransferManager.decrypt(key)
);

ipc.answerRenderer('data-transfer-download', address =>
  dataTransferManager.download(address)
);

ipc.answerRenderer('data-transfer-encrypt', () =>
  dataTransferManager.encrypt()
);

ipc.answerRenderer('data-transfer-export-database', ({ accountId }) =>
  dataTransferManager.exportDatabase({ accountId })
);

ipc.answerRenderer(
  'data-transfer-import-database',
  ({ accountId, resetAccountData }) =>
    dataTransferManager.importDatabase({ accountId, resetAccountData })
);

ipc.answerRenderer('data-transfer-upload', randomId =>
  dataTransferManager.upload(randomId)
);
