const ipc = require('@criptext/electron-better-ipc');
const clientManager = require('./../clientManager');

ipc.answerRenderer('client-find-key-bundles', params => {
  clientManager.findKeyBundles(params);
});

ipc.answerRenderer('client-post-email', params => {
  clientManager.postEmail(params);
});
