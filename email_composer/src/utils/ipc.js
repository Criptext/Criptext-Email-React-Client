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

export const closeWindowWithDraft = () => {
  ipc.callMain('close-with-draft', composerId);
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
export const canSend = async () => {
  return await ipc.callMain('client-can-send');
};

export const checkExpiredSession = async params => {
  return await ipc.callMain('client-check-expired-session', params);
};

export const findKeyBundles = async params => {
  return await ipc.callMain('client-find-key-bundles', params);
};

export const getUserSettings = async recipientId => {
  return await ipc.callMain('client-get-user-settings', recipientId);
};

export const isCriptextDomain = async params => {
  return await ipc.callMain('client-is-criptext-domain', params);
};

export const resendConfirmationEmail = async () => {
  return await ipc.callMain('client-resend-confirmation-email');
};

export const postEmail = async params => {
  return await ipc.callMain('client-post-email', params);
};

/* File System
   ----------------------------- */
export const getEmailByKeyWithbody = async params => {
  return await ipc.callMain('db-get-email-with-body', params);
};

/* DataBase
   ----------------------------- */

export const createAlias = async params => {
  return await ipc.callMain('db-create-alias', params);
};

export const createCustomDomain = async params => {
  return await ipc.callMain('db-create-custom-domain', params);
};

export const createEmail = async params => {
  return await ipc.callMain('db-create-email', params);
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

export const deleteAliases = async params => {
  return await ipc.callMain('db-delete-alias', params);
};

export const deleteCustomDomains = async domains => {
  return await ipc.callMain('db-delete-custom-domains', { domains });
};

export const deletePreKeyPair = async params => {
  return await ipc.callMain('db-delete-prekey-pair', params);
};

export const deleteSessionRecord = async params => {
  return await ipc.callMain('db-delete-session-record', params);
};

export const getAlias = async params => {
  return await ipc.callMain('db-get-alias-by-params', params);
};

export const getAllContacts = async () => {
  return await ipc.callMain('db-get-all-contacts');
};

export const getContactsByEmailId = async emailId => {
  return await ipc.callMain('db-get-contact-by-emailid', emailId);
};

export const getCustomDomain = async params => {
  return await ipc.callMain('db-get-custom-domains-by-params', params);
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

export const getSessionRecordByRecipientIds = async params => {
  return await ipc.callMain('db-get-session-record-by-recipientids', params);
};

export const getSessionRecordRowsByRecipientIds = async params => {
  return await ipc.callMain(
    'db-get-session-record-rows-by-recipientids',
    params
  );
};

export const getSignedPreKey = async params => {
  return await ipc.callMain('db-get-signed-prekey', params);
};

export const updateAlias = async params => {
  return await ipc.callMain('db-update-alias', params);
};

export const updateIdentityKeyRecord = async params => {
  return await ipc.callMain('db-update-identity-key-record', params);
};
