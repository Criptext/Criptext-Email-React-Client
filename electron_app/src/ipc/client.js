const ipc = require('@criptext/electron-better-ipc');
const clientManager = require('./../clientManager');

ipc.answerRenderer('client-acknowledge-events', params => {
  clientManager.postEmail(params);
});

ipc.answerRenderer('client-find-key-bundles', params => {
  clientManager.findKeyBundles(params);
});

ipc.answerRenderer('client-get-data-ready', () => {
  clientManager.getDataReady();
});

ipc.answerRenderer('client-post-email', params => {
  clientManager.postEmail(params);
});
