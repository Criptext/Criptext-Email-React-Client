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
export const resetPassword = async recipientId => {
  return await callMain('client-reset-password', recipientId);
};
