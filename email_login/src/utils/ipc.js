import ipc from '@criptext/electron-better-ipc/renderer';

export const checkForUpdates = showDialog => {
  ipc.callMain('check-for-updates', showDialog);
};

export const closeLoginWindow = params => {
  ipc.callMain('close-login', params);
};

export const getComputerName = () => ipc.callMain('get-computer-name');

export const getOsAndArch = () => ipc.callMain('get-os-and-arch');

export const isWindows = () => ipc.callMain('get-isWindows');

export const minimizeLoginWindow = () => {
  ipc.callMain('minimize-login');
};

export const openCreateKeysLoadingWindow = params => {
  ipc.callMain('open-create-keys-loading', params);
};

export const openPinWindow = params => {
  ipc.callMain('open-pin', params);
};

export const restartAlice = async () => {
  return await ipc.callMain('restart-alice');
};

export const upgradeToPlus = token => {
  ipc.callMain('upgrade-to-plus', token);
};

export const sendPin = params => ipc.callMain('send-pin', params);

export const throwError = error => {
  ipc.callMain('throwError', error);
};

export const createDefaultBackupFolder = async () => {
  return await ipc.callMain('create-default-backup-folder');
};

export const getDefaultBackupFolder = async () => {
  return await ipc.callMain('get-default-backup-folder');
};

export const swapMailboxAccount = params => {
  ipc.callMain('swap-account', params);
};

export const storeRecoveryKey = params =>
  ipc.callMain('store-recovery-key', params);

/* Logger Call
----------------------------- */
export const logErrorAndReport = stack => {
  ipc.callMain('nucleups-report-uncaught-error', stack);
  ipc.callMain('log-error', stack);
};

export const logLocal = stack => {
  ipc.callMain('log-info', stack);
};

/*  Database
----------------------------- */
export const cleanDatabase = async username => {
  return await ipc.callMain('db-clean-database', username);
};

export const createContact = async params => {
  return await ipc.callMain('db-create-contact', params);
};

export const getAccountByParams = async params => {
  return await ipc.callMain('db-get-account-by-params', params);
};

export const getContactByEmails = async params => {
  return await ipc.callMain('db-get-contact-by-emails', params);
};

export const updateAccount = async params => {
  return await ipc.callMain('db-update-account', params);
};

export const updateSettings = async params => {
  return await ipc.callMain('db-update-settings', params);
};

/*  Criptext Client
----------------------------- */
export const canLogin = async params => {
  return await ipc.callMain('client-can-login', params);
};

export const canSend = async params => {
  return await ipc.callMain('client-can-send', params);
};

export const checkAvailableUsername = async username => {
  return await ipc.callMain('client-check-available-username', username);
};

export const checkAvailableRecoveryEmail = async params => {
  return await ipc.callMain('client-check-recovery-email', params);
};

export const deleteDeviceToken = async params => {
  return await ipc.callMain('client-delete-device-token', params);
};

export const getCaptcha = async () => {
  return await ipc.callMain('client-get-captcha');
};

export const getMaxDevices = async params => {
  return await ipc.callMain('client-get-max-devices', params);
};

export const linkAuth = async newDeviceData => {
  return await ipc.callMain('client-link-auth', newDeviceData);
};

export const linkCancel = async newDeviceData => {
  return await ipc.callMain('client-link-cancel', newDeviceData);
};

export const findDevices = async params => {
  return await ipc.callMain('client-find-devices', params);
};

export const linkBegin = async params => {
  return await ipc.callMain('client-link-begin', params);
};

export const linkStatus = async recipientId => {
  return await ipc.callMain('client-link-status', recipientId);
};

export const login = async params => {
  return await ipc.callMain('client-login', params);
};

export const loginFirst = async params => {
  return await ipc.callMain('client-login-first', params);
};

export const postUser = async params => {
  return await ipc.callMain('client-post-user', params);
};

export const resendConfirmationEmail = async params => {
  return await ipc.callMain('client-resend-confirmation-email', params);
};

export const resetPassword = async params => {
  return await ipc.callMain('client-reset-password', params);
};

export const sendRecoveryCode = async params => {
  return await ipc.callMain('client-send-recovery-code', params);
};

export const uploadAvatar = async params => {
  return await ipc.callMain('client-upload-avatar', params);
};

export const validateRecoveryCode = async params => {
  return await ipc.callMain('client-validate-recovery-code', params);
};
