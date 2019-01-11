const ipc = require('@criptext/electron-better-ipc');
const clientManager = require('./../clientManager');

ipc.answerRenderer('client-acknowledge-events', params =>
  clientManager.acknowledgeEvents(params)
);

ipc.answerRenderer('client-change-password', params =>
  clientManager.changePassword(params)
);

ipc.answerRenderer('client-change-recovery-email', params =>
  clientManager.changeRecoveryEmail(params)
);

ipc.answerRenderer('client-delete-my-account', password =>
  clientManager.deleteMyAccount(password)
);

ipc.answerRenderer('client-find-key-bundles', params =>
  clientManager.findKeyBundles(params)
);

ipc.answerRenderer('client-get-data-ready', () => clientManager.getDataReady());

ipc.answerRenderer('client-get-email-body', params =>
  clientManager.getEmailBody(params)
);

ipc.answerRenderer('client-get-events', () => clientManager.getEvents());

ipc.answerRenderer('client-get-key-bundle', deviceId =>
  clientManager.getKeyBundle(deviceId)
);

ipc.answerRenderer('client-get-user-settings', () =>
  clientManager.getUserSettings()
);

ipc.answerRenderer('client-link-accept', randomId =>
  clientManager.linkAccept(randomId)
);

ipc.answerRenderer('client-link-deny', randomId =>
  clientManager.linkDeny(randomId)
);

ipc.answerRenderer('client-logout', () =>
  clientManager.logout()
);

ipc.answerRenderer('client-post-data-ready', params =>
  clientManager.postDataReady(params)
);

ipc.answerRenderer('client-post-email', params =>
  clientManager.postEmail(params)
);

ipc.answerRenderer('client-post-open-event', params =>
  clientManager.postOpenEvent(params)
);

ipc.answerRenderer('client-post-user', params =>
  clientManager.postUser(params)
);

ipc.answerRenderer('client-remove-device', params =>
  clientManager.removeDevice(params)
);

ipc.answerRenderer('client-sync-accept', randomId =>
  clientManager.syncAccept(randomId)
);

ipc.answerRenderer('client-sync-deny', randomId =>
  clientManager.syncDeny(randomId)
);
