import { callMain } from '@criptext/electron-better-ipc/renderer';

export const closeCreatingKeysLoadingWindow = () => {
  callMain('close-create-keys-loading');
};

export const getComputerName = () => callMain('get-computer-name');

export const openMailboxWindow = () => {
  callMain('open-mailbox');
};

export const throwError = error => {
  callMain('throwError', error);
};
