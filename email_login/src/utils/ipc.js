import { callMain } from '@criptext/electron-better-ipc/renderer';

export const closeLoginWindow = params => {
  callMain('close-login', params);
};

export const getComputerName = () => callMain('get-computer-name');

export const getOsAndArch = () => callMain('get-os-and-arch');

export const isWindows = () => callMain('get-isWindows');

export const minimizeLoginWindow = () => {
  callMain('minimize-login');
};

export const openCreateKeysLoadingWindow = params => {
  callMain('open-create-keys-loading', params);
};

export const throwError = error => {
  callMain('throwError', error);
};

/*  Database
----------------------------- */
export const getAccountByParams = async params => {
  return await callMain('db-get-account-by-params', params);
};

export const updateAccount = async params => {
  return await callMain('db-update-account', params);
};

/*  Criptext Client
----------------------------- */
export const canLogin = async params => {
  return await callMain('client-can-login', params);
};

export const checkAvailableUsername = async username => {
  return await callMain('client-check-available-username', username);
};

export const deleteDeviceToken = async params => {
  return await callMain('client-delete-device-token', params);
};

export const linkAuth = async newDeviceData => {
  return await callMain('client-link-auth', newDeviceData);
};

export const linkCancel = async newDeviceData => {
  return await callMain('client-link-cancel', newDeviceData);
};

export const findDevices = async params => {
  return await callMain('client-find-devices', params);
};

export const linkBegin = async params => {
  return await callMain('client-link-begin', params);
};

export const linkStatus = async () => {
  return await callMain('client-link-status');
};

export const login = async params => {
  return await callMain('client-login', params);
};

export const loginFirst = async params => {
  return await callMain('client-login-first', params);
};

export const resetPassword = async params => {
  return await callMain('client-reset-password', params);
};

export const sendRecoveryCode = async params => {
  return await callMain('client-send-recovery-code', params);
};

export const validateRecoveryCode = async params => {
  return await callMain('client-validate-recovery-code', params);
};
