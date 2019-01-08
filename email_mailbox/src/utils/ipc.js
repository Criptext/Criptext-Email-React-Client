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

/* Criptext Client
   ----------------------------- */
export const acknowledgeEvents = async eventIds => {
  return await callMain('client-acknowledge-events', eventIds);
};

/* DataBase
   ----------------------------- */
export const cleanDatabase = async () => {
  return await callMain('db-clean-database');
};

export const createEmail = async params => {
  return await callMain('db-create-email', params);
};

export const createEmailLabel = async params => {
  return await callMain('db-create-email-label', params);
};

export const createFeedItem = async params => {
  return await callMain('db-create-feed-item', params);
};

export const createIdentityKeyRecord = async params => {
  return await callMain('db-create-identity-key-record', params);
};

export const createLabel = async params => {
  return await callMain('db-create-label', params);
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

export const deleteEmailByKeys = async keys => {
  return await callMain('db-delete-email-by-keys', keys);
};

export const deleteEmailLabel = async params => {
  return await callMain('db-delete-email-label', params);
};

export const deleteEmailsByIds = async ids => {
  return await callMain('db-delete-emails-by-ids', ids);
};

export const deleteEmailsByThreadIdAndLabelId = async ({
  threadIds,
  labelId
}) => {
  return await callMain('db-delete-emails-by-threadid-and-labelid', {
    threadIds,
    labelId
  });
};

export const deleteFeedItemById = async feedItemId => {
  return await callMain('db-delete-feed-item-by-id', feedItemId);
};

export const deleteLabelById = async labelId => {
  return await callMain('db-delete-label-by-id', labelId);
};

export const deletePreKeyPair = async params => {
  return await callMain('db-delete-prekey-pair', params);
};

export const deleteSessionRecord = async params => {
  return await callMain('db-delete-session-record', params);
};

export const getAllFeedItems = async () => {
  return await callMain('db-get-all-feed-items');
};

export const getAllLabels = async () => {
  return await callMain('db-get-all-labels');
};

export const getContactByEmails = async emails => {
  return await callMain('db-get-contact-by-emails', emails);
};

export const getContactByIds = async ids => {
  return await callMain('db-get-contact-by-ids', ids);
};

export const getEmailByKey = async key => {
  return await callMain('db-get-email-by-key', key);
};

export const getEmailsByIds = async emailIds => {
  return await callMain('db-get-emails-by-ids', emailIds);
};

export const getFileKeyByEmailId = async emailId => {
  return await callMain('db-get-filekey-by-emailid', emailId);
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

export const getSignedPreKey = async params => {
  return await callMain('db-get-signed-prekey', params);
};

export const updateEmail = async params => {
  return await callMain('db-update-email', params);
};

export const updateIdentityKeyRecord = async params => {
  return await callMain('db-update-identity-key-record', params);
};
