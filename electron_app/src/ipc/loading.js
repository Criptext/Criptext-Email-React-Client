const ipc = require('@criptext/electron-better-ipc');
const loadingWindow = require('../windows/loading');
const globalManager = require('../globalManager');

ipc.answerRenderer('close-create-keys-loading', () => {
  loadingWindow.close();
  globalManager.loadingData.set({});
});

ipc.answerRenderer('open-create-keys-loading', arg => {
  globalManager.loadingData.set(arg);
  loadingWindow.show();
});
