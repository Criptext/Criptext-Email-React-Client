import { callMain } from '@criptext/electron-better-ipc/renderer';

export const closeDialogWindow = () => {
  callMain('close-dialog');
};

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

export const openDialogWindow = data => {
  callMain('open-dialog', data);
};

export const throwError = error => {
  callMain('throwError', error);
};
