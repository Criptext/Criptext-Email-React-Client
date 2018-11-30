import { callMain } from '@criptext/electron-better-ipc/renderer';

export const closeDialog = () => {
  callMain('close-dialog');
};

export const getComputerName = () => callMain('get-computer-name');

export const isWindows = () => callMain('get-isWindows');

export const throwError = error => {
  callMain('throwError', error);
};
