import { callMain } from '@criptext/electron-better-ipc/renderer';

/*  Windows call
----------------------------- */
export const checkForUpdates = showDialog => {
  callMain('check-for-updates', showDialog);
};

export const closeMailboxWindow = () => {
  callMain('close-mailbox');
};

export const generateLabelUUID = async () => {
  return await callMain('generate-label-uuid');
};

export const getOsAndArch = () => callMain('get-os-and-arch');

export const installUpdate = () => {
  callMain('install-update');
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

export const restartSocket = async jwt => {
  await callMain('restart-socket', jwt);
};

export const sendEndSyncDevicesEvent = async () => {
  await callMain('close-create-keys-loading');
  return await callMain('end-sync-mailbox-event');
};

export const sendEndLinkDevicesEvent = async () => {
  await callMain('end-link-devices-event');
  return await callMain('close-create-keys-loading');
};

export const sendOpenEmailSource = metadataKey => {
  callMain('open-email-source', metadataKey);
};

export const sendPrintEmailEvent = emailId => {
  callMain('print-to-pdf', { emailId });
};

export const sendPrintThreadEvent = threadId => {
  callMain('print-to-pdf', { threadId });
};

export const sendStartLinkDevicesEvent = data => {
  callMain('start-link-devices-event', data);
};

export const sendStartSyncDeviceEvent = data => {
  callMain('start-sync-mailbox-event', data);
};

export const showNotificationApp = ({ title, message, threadId }) => {
  callMain('show-notification', { title, message, threadId });
};

export const throwError = error => {
  callMain('throwError', error);
};

export const updateDockBadgeApp = value => {
  callMain('update-dock-badge', value);
};

/* File System
----------------------------- */
export const saveEmailBody = async params => {
  return await callMain('fs-save-email-body', params);
};

export const deleteEmailContent = async params => {
  return await callMain('fs-delete-email-content', params);
};

export const downloadFileInFileSystem = async ({
  url,
  filename,
  downloadType,
  metadataKey,
  filesize
}) => {
  return await callMain('fs-download-file', {
    url,
    filename,
    downloadType,
    metadataKey,
    filesize
  });
};

export const checkFileDownloaded = async ({ filename, metadataKey, type }) => {
  return await callMain('fs-check-file-downloaded', {
    filename,
    metadataKey,
    type
  });
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

export const checkExpiredSession = async params => {
  return await callMain('client-check-expired-session', params);
};

export const deleteMyAccount = async password => {
  return await callMain('client-delete-my-account', password);
};

export const getUserSettings = async () => {
  return await callMain('client-get-user-settings');
};

export const insertPreKeys = async preKeys => {
  return await callMain('client-insert-prekeys', preKeys);
};

export const logout = async () => {
  return await callMain('client-logout');
};

export const postPeerEvent = async params => {
  return await callMain('client-post-peer-event', params);
};

export const removeAvatar = async params => {
  return await callMain('client-remove-avatar', params);
};

export const removeDevice = async params => {
  return await callMain('client-remove-device', params);
};

export const resendConfirmationEmail = async () => {
  return await callMain('client-resend-confirmation-email');
};

export const resetPassword = async recipientId => {
  return await callMain('client-reset-password', recipientId);
};

export const setReadTracking = async enabled => {
  return await callMain('client-set-read-tracking', enabled);
};

export const setReplyTo = async params => {
  return await callMain('client-set-reply-to', params);
};

export const setTwoFactorAuth = async enable => {
  return await callMain('client-set-two-factor-auth', enable);
};

export const syncBegin = async () => {
  return await callMain('client-sync-begin');
};

export const syncStatus = async () => {
  return await callMain('client-sync-status');
};

export const unlockDevice = async params => {
  return await callMain('client-unlock-device', params);
};

export const unsendEmailEvent = async metadataKey => {
  return await callMain('client-unsend-email', metadataKey);
};

export const updateDeviceType = async newDeviceType => {
  return await callMain('client-update-device-type', newDeviceType);
};

export const updateNameEvent = async params => {
  return await callMain('client-update-name-event', params);
};

export const updatePushToken = async pushToken => {
  return await callMain('client-update-push-token', pushToken);
};

export const uploadAvatar = async params => {
  return await callMain('client-upload-avatar', params);
};

/*  DataBase
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

export const getAccount = async () => {
  return await callMain('db-get-account');
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

export const getEmailByParams = async params => {
  return await callMain('db-get-email-by-params', params);
};

export const getEmailLabelsByEmailId = async emailId => {
  return await callMain('db-get-email-labels-by-emailid', emailId);
};

export const getEmailsByArrayParam = async emailIds => {
  return await callMain('db-get-emails-by-array-param', emailIds);
};

export const getEmailsByIds = async emailIds => {
  return await callMain('db-get-emails-by-ids', emailIds);
};

export const getEmailsByLabelIds = async labelIds => {
  return await callMain('db-get-emails-by-labelids', labelIds);
};

export const getEmailsByThreadId = async params => {
  return await callMain('db-get-emails-by-threadid', params);
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

export const getFeedItemsCounterBySeen = async seen => {
  return await callMain('db-get-feeditems-counter-by-seen', seen);
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

export const getSessionRecordIds = async () => {
  return await callMain('db-get-prekeys-ids');
};

export const getSignedPreKey = async params => {
  return await callMain('db-get-signed-prekey', params);
};

export const getTrashExpiredEmails = async () => {
  return await callMain('db-get-trash-expired-emails');
};

export const unsendEmail = async params => {
  return await callMain('db-unsend-email', params);
};

export const updateAccount = async params => {
  return await callMain('db-update-account', params);
};

export const updateContactByEmail = async ({ email, name }) => {
  return await callMain('db-update-contact-by-email', { email, name });
};

export const updateContactSpamScore = async params => {
  return await callMain('db-update-contact-spam-acore', params);
};

export const updateEmail = async params => {
  return await callMain('db-update-email', params);
};

export const updateEmails = async params => {
  return await callMain('db-update-emails', params);
};

export const updateFeedItems = async params => {
  return await callMain('db-update-feed-items', params);
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

export const updateSettings = async params => {
  return await callMain('db-update-settings', params);
};

export const updateUnreadEmailByThreadIds = async ({ threadIds, unread }) => {
  return await callMain('db-update-unread-email-by-threadids', {
    threadIds,
    unread
  });
};

/* DataTransfer
----------------------------- */
export const downloadBackupFile = async address => {
  return await callMain('data-transfer-download', address);
};

export const decryptBackupFile = async key => {
  return await callMain('data-transfer-decrypt', key);
};

export const importDatabase = async () => {
  return await callMain('data-transfer-import');
};

export const clearSyncData = async () => {
  return await callMain('data-transfer-clear-sync-data');
};

/* Backup
----------------------------- */
export const createDefaultBackupFolder = async () => {
  return await callMain('create-default-backup-folder');
};

export const exportBackupUnencrypted = async params => {
  return await callMain('export-backup-unencrypted', params);
};

export const exportBackupEncrypted = async params => {
  return await callMain('export-backup-encrypted', params);
};

export const getDefaultBackupFolder = async () => {
  return await callMain('get-default-backup-folder');
};

export const restoreBackupEncrypted = async params => {
  return await callMain('restore-backup-encrypted', params);
};

export const restoreBackupUnencrypted = async params => {
  return await callMain('restore-backup-unencrypted', params);
};
