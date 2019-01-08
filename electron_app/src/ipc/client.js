const ipc = require('@criptext/electron-better-ipc');
const clientManager = require('./../clientManager');

ipc.answerRenderer('client-acknowledge-events', params =>
  clientManager.acknowledgeEvents(params)
);

ipc.answerRenderer('client-find-key-bundles', params =>
  clientManager.findKeyBundles(params)
);

ipc.answerRenderer('client-get-data-ready', () => clientManager.getDataReady());

ipc.answerRenderer('client-get-key-bundle', deviceId =>
  clientManager.getKeyBundle(deviceId)
);

ipc.answerRenderer('client-link-accept', randomId =>
  clientManager.linkAccept(randomId)
);

ipc.answerRenderer('client-link-deny', randomId =>
  clientManager.linkDeny(randomId)
);

ipc.answerRenderer('client-post-data-ready', params =>
  clientManager.postDataReady(params)
);

ipc.answerRenderer('client-post-email', params =>
  clientManager.postEmail(params)
);

ipc.answerRenderer('client-post-user', params =>
  clientManager.postUser(params)
);

ipc.answerRenderer('client-sync-accept', randomId =>
  clientManager.syncAccept(randomId)
);

ipc.answerRenderer('client-sync-deny', randomId =>
  clientManager.syncDeny(randomId)
);
