const ipc = require('@criptext/electron-better-ipc');
const clientManager = require('./../clientManager');

ipc.answerRenderer('client-acknowledge-events', params =>
  clientManager.acknowledgeEvents(params)
);

ipc.answerRenderer('client-can-login', ({ username, domain }) =>
  clientManager.canLogin({ username, domain })
);

ipc.answerRenderer('client-change-password', params =>
  clientManager.changePassword(params)
);

ipc.answerRenderer('client-change-recovery-email', params =>
  clientManager.changeRecoveryEmail(params)
);

ipc.answerRenderer('client-check-available-username', params =>
  clientManager.checkAvailableUsername(params)
);

ipc.answerRenderer(
  'client-check-expired-session',
  ({ response, initialRequest, requestParams }) =>
    clientManager.checkExpiredSession(response, initialRequest, requestParams)
);

ipc.answerRenderer('client-delete-my-account', password =>
  clientManager.deleteMyAccount(password)
);

ipc.answerRenderer('client-find-key-bundles', params =>
  clientManager.findKeyBundles(params)
);

ipc.answerRenderer('client-get-data-ready', () => clientManager.getDataReady());

ipc.answerRenderer('client-get-key-bundle', deviceId =>
  clientManager.getKeyBundle(deviceId)
);

ipc.answerRenderer('client-get-user-settings', () =>
  clientManager.getUserSettings()
);

ipc.answerRenderer('client-insert-prekeys', preKeys =>
  clientManager.insertPreKeys(preKeys)
);

ipc.answerRenderer('client-is-criptext-domain', domains =>
  clientManager.isCriptextDomain(domains)
);

ipc.answerRenderer('client-link-accept', randomId =>
  clientManager.linkAccept(randomId)
);

ipc.answerRenderer('client-link-deny', randomId =>
  clientManager.linkDeny(randomId)
);

ipc.answerRenderer('client-link-status', () => clientManager.linkStatus());

ipc.answerRenderer('client-link-auth', newDeviceData =>
  clientManager.linkAuth(newDeviceData)
);

ipc.answerRenderer('client-link-begin', ({ username, domain }) =>
  clientManager.linkBegin({ username, domain })
);

ipc.answerRenderer('client-login', params => clientManager.login(params));

ipc.answerRenderer('client-login-first', params =>
  clientManager.loginFirst(params)
);

ipc.answerRenderer('client-logout', () => clientManager.logout());

ipc.answerRenderer('client-post-data-ready', params =>
  clientManager.postDataReady(params)
);

ipc.answerRenderer('client-post-email', params =>
  clientManager.postEmail(params)
);

ipc.answerRenderer('client-post-key-bundle', params =>
  clientManager.postKeyBundle(params)
);

ipc.answerRenderer('client-post-peer-event', params =>
  clientManager.postPeerEvent(params)
);

ipc.answerRenderer('client-post-user', params =>
  clientManager.postUser(params)
);

ipc.answerRenderer('client-remove-avatar', clientManager.removeAvatar);

ipc.answerRenderer('client-remove-device', params =>
  clientManager.removeDevice(params)
);

ipc.answerRenderer('client-resend-confirmation-email', () =>
  clientManager.resendConfirmationEmail()
);

ipc.answerRenderer('client-reset-password', params =>
  clientManager.resetPassword(params)
);

ipc.answerRenderer('client-set-read-tracking', enabled =>
  clientManager.setReadTracking(enabled)
);

ipc.answerRenderer('client-set-reply-to', params =>
  clientManager.setReplyTo(params)
);

ipc.answerRenderer('client-set-two-factor-auth', enable =>
  clientManager.setTwoFactorAuth(enable)
);

ipc.answerRenderer('client-sync-accept', randomId =>
  clientManager.syncAccept(randomId)
);

ipc.answerRenderer('client-sync-begin', () => clientManager.syncBegin());

ipc.answerRenderer('client-sync-deny', randomId =>
  clientManager.syncDeny(randomId)
);

ipc.answerRenderer('client-sync-status', () => clientManager.syncStatus());

ipc.answerRenderer('client-unlock-device', params =>
  clientManager.unlockDevice(params)
);

ipc.answerRenderer('client-unsend-email', metadataKey =>
  clientManager.unsendEmail(metadataKey)
);

ipc.answerRenderer('client-update-device-type', newDeviceType =>
  clientManager.updateDeviceType(newDeviceType)
);

ipc.answerRenderer('client-update-name-event', params =>
  clientManager.updateName(params)
);

ipc.answerRenderer('client-update-push-token', pushToken =>
  clientManager.updatePushToken(pushToken)
);

ipc.answerRenderer('client-upload-avatar', clientManager.uploadAvatar);
