import ipc from '@criptext/electron-better-ipc/renderer';

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

export const sendPin = params => {
  ipc.callMain('send-pin', params);
};

export const throwError = error => {
  ipc.callMain('throwError', error);
};

/*  Database
----------------------------- */
export const getAccountByParams = async params => {
  return await ipc.callMain('db-get-account-by-params', params);
};

export const updateAccount = async params => {
  return await ipc.callMain('db-update-account', params);
};

/*  Criptext Client
----------------------------- */
export const canLogin = async params => {
  return await ipc.callMain('client-can-login', params);
};

export const checkAvailableUsername = async username => {
  return await ipc.callMain('client-check-available-username', username);
};

export const deleteDeviceToken = async params => {
  return await ipc.callMain('client-delete-device-token', params);
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

export const linkStatus = async () => {
  return await ipc.callMain('client-link-status');
};

export const login = async params => {
  return await ipc.callMain('client-login', params);
};

export const loginFirst = async params => {
  return await ipc.callMain('client-login-first', params);
};

export const resetPassword = async params => {
  return await ipc.callMain('client-reset-password', params);
};

export const sendRecoveryCode = async params => {
  return await ipc.callMain('client-send-recovery-code', params);
};

export const validateRecoveryCode = async params => {
  return await ipc.callMain('client-validate-recovery-code', params);
};
