import { callMain } from '@criptext/electron-better-ipc/renderer';
const electron = window.require('electron');
const { remote } = electron;
const composerId = remote.getCurrentWindow().id;

/*  Windows call
----------------------------- */
export const closeComposerWindow = ({
  threadId,
  emailId,
  hasExternalPassphrase
}) => {
  callMain('close-composer', {
    composerId,
    threadId,
    emailId,
    hasExternalPassphrase
  });
};

export const openFilledComposerWindow = data => {
  callMain('open-filled-composer', data);
};

export const openFileExplorer = filename => {
  callMain('open-file-explorer', filename);
};

export const saveDraftChangesComposerWindow = data => {
  callMain('save-draft-changes', { composerId, data });
};

export const throwError = error => {
  callMain('throwError', error);
};

/* DataBase
   ----------------------------- */
export const createEmail = async params => {
  return await callMain('db-create-email', params);
};

export const createEmailLabel = async params => {
  return await callMain('db-create-email-label', params);
};

export const createFile = async params => {
  return await callMain('db-create-file', params);
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

export const deleteEmailsByIds = async ids => {
  return await callMain('db-delete-emails-by-ids', ids);
};

export const deletePreKeyPair = async params => {
  return await callMain('db-delete-prekey-pair', params);
};

export const deleteSessionRecord = async params => {
  return await callMain('db-delete-session-record', params);
};

export const getAllContacts = async () => {
  return await callMain('db-get-all-contacts');
};

export const getEmailByKey = async key => {
  return await callMain('db-get-email-by-key', key);
};

export const getFilesByEmailId = async emailId => {
  return await callMain('db-get-files-by-emailid', emailId);
};
