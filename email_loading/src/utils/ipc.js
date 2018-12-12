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

/* DataBase
   ----------------------------- */
export const createIdentityKeyRecord = async params => {
  return await callMain('db-create-identity-key-record', params);
};

export const createPreKeyRecord = async params => {
  return await callMain('db-create-pre-key-record', params);
};
