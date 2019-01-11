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

export const sendStartSyncDeviceEvent = data => {
  callMain('start-sync-mailbox-event', data);
};

export const sendStartLinkDevicesEvent = data => {
  callMain('start-link-devices-event', data);
};

/* Criptext Client
   ----------------------------- */
export const acknowledgeEvents = async eventIds => {
  return await callMain('client-acknowledge-events', eventIds);
};

export const changePassword = async params => {
  return await callMain('client-change-password', params);
};

export const changeRecoveryEmail = async params => {
  return await callMain('client-change-recovery-email', params);
};

/* DataBase
   ----------------------------- */
export const cleanDatabase = async () => {
  return await callMain('db-clean-database');
};

export const cleanDataLogout = async recipientId => {
  return await callMain('db-clean-data-logout', recipientId);
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

export const createSignalTables = async () => {
  return await callMain('db-create-signal-tables');
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

export const getDataReady = async () => {
  return await callMain('client-get-data-ready');
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

export const getEmailLabelsByEmailId = async emailId => {
  return await callMain('db-get-email-labels-by-emailid', emailId);
};

export const getEmailsByIds = async emailIds => {
  return await callMain('db-get-emails-by-ids', emailIds);
};

export const getEmailsByKeys = async emailKeys => {
  return await callMain('db-get-emails-by-keys', emailKeys);
};

export const getEmailsByLabelIds = async labelIds => {
  return await callMain('db-get-emails-by-labelids', labelIds);
};

export const getEmailsByThreadId = async threadId => {
  return await callMain('db-get-emails-by-threadid', threadId);
};

export const getEmailsByThreadIdAndLabelId = async ({ threadIds, labelId }) => {
  return await callMain('db-get-emails-by-threadid-and-labelid', {
    threadIds,
    labelId
  });
};

export const getEmailsCounterByLabelId = async labelId => {
  return await callMain('db-get-emails-counter-by-labelid', labelId);
};

export const getEmailsGroupByThreadByParams = async params => {
  return await callMain('db-get-emails-group-by-thread-by-params', params);
};

export const getEmailsUnredByLabelId = async params => {
  return await callMain('db-get-emails-unread-by-labelid', params);
};

export const getFilesByTokens = async tokens => {
  return await callMain('db-get-files-by-tokens', tokens);
};

export const getFileKeyByEmailId = async emailId => {
  return await callMain('db-get-filekey-by-emailid', emailId);
};

export const getIdentityKeyRecord = async params => {
  return await callMain('db-get-identity-key-record', params);
};

export const getLabelById = async id => {
  return await callMain('db-get-labelid', id);
};

export const getLabelsByText = async text => {
  return await callMain('db-get-labesls-by-text', text);
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

export const getTrashExpiredEmails = async () => {
  return await callMain('db-get-trash-expired-emails');
};

export const updateAccount = async params => {
  return await callMain('db-update-account', params);
};

export const updateContactByEmail = async ({ email, name }) => {
  return await callMain('db-update-contact-by-email', { email, name });
};

export const updateEmail = async params => {
  return await callMain('db-update-email', params);
};

export const updateEmails = async params => {
  return await callMain('db-update-emails', params);
};

export const updateFeedItem = async ({ feedItemId, seen }) => {
  return await callMain('db-update-feed-item', { feedItemId, seen });
};

export const updateFilesByEmailId = async ({ emailId, status }) => {
  return await callMain('db-update-files-by-emailid', { emailId, status });
};

export const updateIdentityKeyRecord = async params => {
  return await callMain('db-update-identity-key-record', params);
};

export const updateLabel = async params => {
  return await callMain('db-update-label', params);
};

export const updateSettings = async ({ opened, language, theme }) => {
  return await callMain('db-update-settings', { opened, language, theme });
};

export const updateUnreadEmailByThreadIds = async ({ threadIds, unread }) => {
  return await callMain('db-update-unread-email-by-threadids', {
    threadIds,
    unread
  });
};
