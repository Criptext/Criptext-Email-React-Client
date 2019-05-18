import { callMain } from '@criptext/electron-better-ipc/renderer';

export const closeLoginWindow = isExit => {
  callMain('close-login', isExit);
};

export const getComputerName = () => callMain('get-computer-name');

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
export const checkAvailableUsername = async username => {
  return await callMain('client-check-available-username', username);
};

export const linkAuth = async newDeviceData => {
  return await callMain('client-link-auth', newDeviceData);
};

export const linkBegin = async username => {
  return await callMain('client-link-begin', username);
};

export const linkStatus = async () => {
  return await callMain('client-link-status');
};

export const login = async params => {
  return await callMain('client-login', params);
};

export const resetPassword = async recipientId => {
  return await callMain('client-reset-password', recipientId);
};
