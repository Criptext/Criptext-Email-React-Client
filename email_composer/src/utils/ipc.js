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

/* Criptext Client
----------------------------- */
export const checkExpiredSession = async params => {
  return await callMain('client-check-expired-session', params);
};

export const findKeyBundles = async params => {
  return await callMain('client-find-key-bundles', params);
};

export const isCriptextDomain = async domains => {
  return await callMain('client-is-criptext-domain', domains);
};

export const postEmail = async params => {
  return await callMain('client-post-email', params);
};

/* File System
   ----------------------------- */
export const saveEmailBody = async params => {
  return await callMain('fs-save-email-body', params);
};

export const getEmailByKeyWithbody = async params => {
  return await callMain('db-get-email-with-body', params);
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

export const getContactsByEmailId = async emailId => {
  return await callMain('db-get-contact-by-emailid', emailId);
};

export const getEmailByKey = async key => {
  return await callMain('db-get-email-by-key', key);
};

export const getFilesByEmailId = async emailId => {
  return await callMain('db-get-files-by-emailid', emailId);
};

export const getIdentityKeyRecord = async params => {
  return await callMain('db-get-identity-key-record', params);
};

export const getPreKeyPair = async params => {
  return await callMain('db-get-prekey-pair', params);
};

export const getSessionRecord = async params => {
  return await callMain('db-get-session-record', params);
};

export const getSessionRecordByRecipientIds = async recipientIds => {
  return await callMain('db-get-session-record-by-recipientids', recipientIds);
};

export const getSignedPreKey = async params => {
  return await callMain('db-get-signed-prekey', params);
};

export const updateEmail = async params => {
  return await callMain('db-update-email', params);
};

export const updateIdentityKeyRecord = async params => {
  return await callMain('db-update-identity-key-record', params);
};
