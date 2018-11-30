import { callMain } from '@criptext/electron-better-ipc/renderer';

export const openMailbox = () => {
  callMain('open-mailbox');
};

export const throwError = error => {
  callMain('throwError', error);
};
