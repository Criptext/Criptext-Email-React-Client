const { ipcMain: ipc } = require('@criptext/electron-better-ipc');
const clientManager = require('./../clientManager');
const myAccount = require('../Account');

ipc.answerRenderer('client-activate-address', params =>
  clientManager.activateAddress(params)
);

ipc.answerRenderer('client-acknowledge-events', params =>
  clientManager.acknowledgeEvents(params)
);

ipc.answerRenderer('client-can-login', ({ username, domain }) =>
  clientManager.canLogin({ username, domain })
);

ipc.answerRenderer('client-change-password', params => {
  const data = { ...params, recipientId: myAccount.recipientId };
  return clientManager.changePassword(data);
});

ipc.answerRenderer('client-change-recovery-email', params => {
  const data = { ...params, recipientId: myAccount.recipientId };
  return clientManager.changeRecoveryEmail(data);
});

ipc.answerRenderer('client-check-available-username', params =>
  clientManager.checkAvailableUsername(params)
);

ipc.answerRenderer(
  'client-check-expired-session',
  ({ response, initialRequest, requestParams }) =>
    clientManager.checkExpiredSession(response, initialRequest, requestParams)
);

ipc.answerRenderer('client-delete-address', addressId =>
  clientManager.deleteAddress(addressId)
);

ipc.answerRenderer('client-delete-device-token', params =>
  clientManager.deleteDeviceToken(params)
);

ipc.answerRenderer('client-delete-my-account', params => {
  const data = { ...params, recipientId: myAccount.recipientId };
  return clientManager.deleteMyAccount(data);
});

ipc.answerRenderer('client-find-devices', params =>
  clientManager.findDevices(params)
);

ipc.answerRenderer('client-find-key-bundles', params =>
  clientManager.findKeyBundles(params)
);

ipc.answerRenderer('client-get-data-ready', recipientId =>
  clientManager.getDataReady(recipientId)
);

ipc.answerRenderer('client-get-domain-mx', domain =>
  clientManager.getDomainMX(domain)
);

ipc.answerRenderer('client-get-key-bundle', params =>
  clientManager.getKeyBundle(params)
);

ipc.answerRenderer('client-get-user-settings', () =>
  clientManager.getUserSettings(myAccount.recipientId)
);

ipc.answerRenderer('client-insert-prekeys', params =>
  clientManager.insertPreKeys(params)
);

ipc.answerRenderer('client-domain-available', domain =>
  clientManager.isDomainAvailable(domain)
);

ipc.answerRenderer('client-is-criptext-domain', domains => {
  const data = { domains, recipientId: myAccount.recipientId };
  return clientManager.isCriptextDomain(data);
});

ipc.answerRenderer('client-link-accept', randomId => {
  const data = { randomId, recipientId: myAccount.recipientId };
  return clientManager.linkAccept(data);
});

ipc.answerRenderer('client-link-deny', randomId => {
  const data = { randomId, recipientId: myAccount.recipientId };
  return clientManager.linkDeny(data);
});

ipc.answerRenderer('client-link-status', recipientId =>
  clientManager.linkStatus(recipientId)
);

ipc.answerRenderer('client-link-auth', newDeviceData =>
  clientManager.linkAuth(newDeviceData)
);

ipc.answerRenderer('client-link-cancel', newDeviceData =>
  clientManager.linkCancel(newDeviceData)
);

ipc.answerRenderer('client-link-begin', ({ username, domain }) =>
  clientManager.linkBegin({ username, domain })
);

ipc.answerRenderer('client-login', params => clientManager.login(params));

ipc.answerRenderer('client-login-first', params =>
  clientManager.loginFirst(params)
);

ipc.answerRenderer('client-logout', () => {
  return clientManager.logout(myAccount.recipientId);
});

ipc.answerRenderer('client-post-data-ready', params => {
  const data = { ...params, recipientId: myAccount.recipientId };
  return clientManager.postDataReady(data);
});

ipc.answerRenderer('client-post-email', params =>
  clientManager.postEmail(params)
);

ipc.answerRenderer('client-post-key-bundle', params =>
  clientManager.postKeyBundle(params)
);

ipc.answerRenderer('client-post-peer-event', params => {
  const data = {
    ...params,
    accountId: myAccount.id,
    recipientId: myAccount.recipientId
  };
  return clientManager.postPeerEvent(data);
});

ipc.answerRenderer('client-register-domain', domain =>
  clientManager.registerDomain(domain)
);

ipc.answerRenderer('client-post-user', params =>
  clientManager.postUser(params)
);

ipc.answerRenderer('client-remove-avatar', () => {
  return clientManager.removeAvatar(myAccount.recipientId);
});

ipc.answerRenderer('client-remove-device', params => {
  const data = { ...params, recipientId: myAccount.recipientId };
  return clientManager.removeDevice(data);
});

ipc.answerRenderer('client-report-phishing', params => {
  const data = { ...params, recipientId: myAccount.recipientId };
  return clientManager.reportPhishing(data);
});

ipc.answerRenderer('client-resend-confirmation-email', () => {
  return clientManager.resendConfirmationEmail(myAccount.recipientId);
});

ipc.answerRenderer('client-reset-password', params =>
  clientManager.resetPassword(params)
);

ipc.answerRenderer('client-set-address', params =>
  clientManager.setAddress(params)
);

ipc.answerRenderer('client-send-recovery-code', params =>
  clientManager.sendRecoveryCode(params)
);

ipc.answerRenderer('client-set-read-tracking', enabled => {
  const data = { enabled, recipientId: myAccount.recipientId };
  return clientManager.setReadTracking(data);
});

ipc.answerRenderer('client-set-reply-to', params => {
  const data = { ...params, recipientId: myAccount.recipientId };
  return clientManager.setReplyTo(data);
});

ipc.answerRenderer('client-set-two-factor-auth', enable => {
  const data = { enable, recipientId: myAccount.recipientId };
  return clientManager.setTwoFactorAuth(data);
});

ipc.answerRenderer('client-sync-accept', randomId => {
  const data = { randomId, recipientId: myAccount.recipientId };
  return clientManager.syncAccept(data);
});

ipc.answerRenderer('client-sync-begin', () => {
  return clientManager.syncBegin(myAccount.recipientId);
});

ipc.answerRenderer('client-sync-cancel', () => {
  return clientManager.syncCancel(myAccount.recipientId);
});

ipc.answerRenderer('client-sync-deny', randomId => {
  const data = { randomId, recipientId: myAccount.recipientId };
  return clientManager.syncDeny(data);
});

ipc.answerRenderer('client-sync-status', () => {
  return clientManager.syncStatus(myAccount.recipientId);
});

ipc.answerRenderer('client-unlock-device', params => {
  const data = { ...params, recipientId: myAccount.recipientId };
  return clientManager.unlockDevice(data);
});

ipc.answerRenderer('client-unsend-email', metadataKey => {
  const data = { metadataKey, recipientId: myAccount.recipientId };
  return clientManager.unsendEmail(data);
});

ipc.answerRenderer('client-update-device-type', newDeviceType => {
  const data = { newDeviceType, recipientId: myAccount.recipientId };
  return clientManager.updateDeviceType(data);
});

ipc.answerRenderer('client-update-name-event', params => {
  const data = { ...params, recipientId: myAccount.recipientId };
  return clientManager.updateName(data);
});

ipc.answerRenderer('client-update-push-token', pushToken => {
  const data = { pushToken, recipientId: myAccount.recipientId };
  return clientManager.updatePushToken(data);
});

ipc.answerRenderer('client-upload-avatar', params => {
  const data = { ...params, recipientId: myAccount.recipientId };
  return clientManager.uploadAvatar(data);
});

ipc.answerRenderer('client-validate-mx-records', domain =>
  clientManager.validateDomainMX(domain)
);

ipc.answerRenderer('client-validate-recovery-code', params =>
  clientManager.validateRecoveryCode(params)
);
