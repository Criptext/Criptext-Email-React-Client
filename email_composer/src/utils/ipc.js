import ipc from '@criptext/electron-better-ipc/renderer';
const electron = window.require('electron');
const { remote } = electron;
const composerId = remote.getCurrentWindow().id;

/*  Windows call
----------------------------- */
export const closeComposerWindow = ({
  threadId,
  emailId,
  discard,
  hasExternalPassphrase
}) => {
  ipc.callMain('close-composer', {
    composerId,
    discard,
    threadId,
    emailId,
    hasExternalPassphrase
  });
};

export const openFilledComposerWindow = data => {
  ipc.callMain('open-filled-composer', data);
};

export const openFileExplorer = filename => {
  ipc.callMain('open-file-explorer', filename);
};

export const saveDraftChangesComposerWindow = data => {
  ipc.callMain('save-draft-changes', { composerId, data });
};

export const throwError = error => {
  ipc.callMain('throwError', error);
};

export const restartAlice = async () => {
  return await ipc.callMain('restart-alice');
};

/* Criptext Client
----------------------------- */
export const checkExpiredSession = async params => {
  return await ipc.callMain('client-check-expired-session', params);
};

export const findKeyBundles = async params => {
  return await ipc.callMain('client-find-key-bundles', params);
};

export const isCriptextDomain = async domains => {
  return await ipc.callMain('client-is-criptext-domain', domains);
};

export const postEmail = async params => {
  return await ipc.callMain('client-post-email', params);
};

/* File System
   ----------------------------- */
export const saveEmailBody = async params => {
  return await ipc.callMain('fs-save-email-body', params);
};

export const getEmailByKeyWithbody = async params => {
  return await ipc.callMain('db-get-email-with-body', params);
};

/* DataBase
   ----------------------------- */
export const createEmail = async params => {
  return await ipc.callMain('db-create-email', params);
};

export const createEmailLabel = async params => {
  return await ipc.callMain('db-create-email-label', params);
};

export const createIdentityKeyRecord = async params => {
  return await ipc.callMain('db-create-identity-key-record', params);
};

export const createPreKeyRecord = async params => {
  return await ipc.callMain('db-create-prekey-record', params);
};

export const createSessionRecord = async params => {
  return await ipc.callMain('db-create-session-record', params);
};

export const createSignedPreKeyRecord = async params => {
  return await ipc.callMain('db-create-signed-prekey-record', params);
};

export const deleteEmailsByIds = async ids => {
  return await ipc.callMain('db-delete-emails-by-ids', ids);
};

export const deletePreKeyPair = async params => {
  return await ipc.callMain('db-delete-prekey-pair', params);
};

export const deleteSessionRecord = async params => {
  return await ipc.callMain('db-delete-session-record', params);
};

export const getAllContacts = async () => {
  return await ipc.callMain('db-get-all-contacts');
};

export const getContactsByEmailId = async emailId => {
  return await ipc.callMain('db-get-contact-by-emailid', emailId);
};

export const getEmailByKey = async key => {
  return await ipc.callMain('db-get-email-by-key', key);
};

export const getFilesByEmailId = async emailId => {
  return await ipc.callMain('db-get-files-by-emailid', emailId);
};

export const getIdentityKeyRecord = async params => {
  return await ipc.callMain('db-get-identity-key-record', params);
};

export const getPreKeyPair = async params => {
  return await ipc.callMain('db-get-prekey-pair', params);
};

export const getSessionRecord = async params => {
  return await ipc.callMain('db-get-session-record', params);
};

export const getSessionRecordByRecipientIds = async recipientIds => {
  return await ipc.callMain(
    'db-get-session-record-by-recipientids',
    recipientIds
  );
};

export const getSignedPreKey = async params => {
  return await ipc.callMain('db-get-signed-prekey', params);
};

export const updateEmail = async params => {
  return await ipc.callMain('db-update-email', params);
};

export const updateIdentityKeyRecord = async params => {
  return await ipc.callMain('db-update-identity-key-record', params);
};
