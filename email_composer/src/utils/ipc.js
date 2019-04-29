import { callMain } from '@criptext/electron-better-ipc/renderer';
import { myAccount } from './electronInterface';
const electron = window.require('electron');
const { remote } = electron;
const composerId = remote.getCurrentWindow().id;
let accountId = '';

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
export const findKeyBundles = async params => {
  checkCurrentAccount();
  const data = { params };
  if (myAccount.id !== accountId) {
    data.accountId = accountId;
  }
  return await callMain('client-find-key-bundles', data);
};

export const postEmail = async params => {
  checkCurrentAccount();
  const data = { params };
  if (myAccount.id !== accountId) {
    data.accountId = accountId;
  }
  return await callMain('client-post-email', data);
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
const checkCurrentAccount = () => {
  if (!accountId || accountId !== myAccount.other.id) {
    accountId = myAccount.other.id || myAccount.id;
  }
};

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
  checkCurrentAccount();
  return await callMain('db-create-identity-key-record', {
    accountId,
    ...params
  });
};

export const createPreKeyRecord = async params => {
  return await callMain('db-create-prekey-record', params);
};

export const createSessionRecord = async params => {
  checkCurrentAccount();
  return await callMain('db-create-session-record', { accountId, ...params });
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

export const getAccount = async () => {
  return await callMain('db-get-account');
};

export const getAccountByParams = async params => {
  return await callMain('db-get-account-by-params', params);
};

export const getAllContacts = async () => {
  checkCurrentAccount();
  return await callMain('db-get-all-contacts', accountId);
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
  checkCurrentAccount();
  return await callMain('db-get-identity-key-record', { accountId, ...params });
};

export const getPreKeyPair = async params => {
  return await callMain('db-get-prekey-pair', params);
};

export const getSessionRecord = async params => {
  checkCurrentAccount();
  return await callMain('db-get-session-record', { accountId, ...params });
};

export const getSessionRecordByRecipientIds = async ({ recipientIds }) => {
  checkCurrentAccount();
  return await callMain('db-get-session-record-by-recipientids', {
    recipientIds,
    accountId
  });
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
