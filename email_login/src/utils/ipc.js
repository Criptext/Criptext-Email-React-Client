import { callMain } from '@criptext/electron-better-ipc/renderer';

export const closeLoginWindow = () => {
  callMain('close-login');
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

/* Criptext Client
   ----------------------------- */
export const linkAuth = async newDeviceData => {
  return await callMain('client-link-auth', newDeviceData);
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
