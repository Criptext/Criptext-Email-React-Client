import { callMain } from '@criptext/electron-better-ipc/renderer';

/*  Windows call
----------------------------- */
export const closeDialogWindow = () => {
  callMain('close-dialog');
};

export const closeMailboxWindow = () => {
  callMain('close-mailbox');
};

export const downloadUpdate = () => {
  callMain('download-update');
};

export const logoutApp = () => {
  callMain('logout-app');
};

export const maximizeMailboxWindow = () => {
  callMain('maximize-mailbox');
};

export const minimizeMailboxWindow = () => {
  callMain('minimize-mailbox');
};

export const openDialogWindow = data => {
  callMain('open-dialog', data);
};

export const openEmptyComposerWindow = () => {
  callMain('open-empty-composer');
};

export const openFilledComposerWindow = data => {
  callMain('open-filled-composer', data);
};

export const openFileExplorer = filename => {
  callMain('open-file-explorer', filename);
};

export const processPendingEvents = () => {
  setTimeout(() => {
    callMain('process-pending-events');
  }, 1000);
};

export const showNotificationApp = ({ title, message }) => {
  callMain('show-notification', { title, message });
};

export const throwError = error => {
  callMain('throwError', error);
};

export const updateDockBadgeApp = value => {
  callMain('update-dock-badge', value);
};

/* DataBase
   ----------------------------- */
export const createEmail = async params => {
  return await callMain('db-create-email', params);
};

export const createEmailLabel = async params => {
  return await callMain('db-create-email-label', params);
};

export const createIdentityKeyRecord = async params => {
  return await callMain('db-create-identity-key-record', params);
};

export const createPreKeyRecord = async params => {
  return await callMain('db-create-prekey-record', params);
};

export const createSessionRecord = async params => {
  return await callMain('db-create-session-record', params);
};

export const createSignedPreKeyRecord = async params => {
  return await callMain('db-create-signed-prekey-record', params);
};

export const deleteEmailsByIds = ids => {
  return await callMain('db-delete-emails-by-ids', ids);
};

export const deletePreKeyPair = async params => {
  return await callMain('db-delete-prekey-pair', params);
};