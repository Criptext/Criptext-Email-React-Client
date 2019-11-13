import ipc from '@criptext/electron-better-ipc/renderer';

/*  Windows call
----------------------------- */
export const checkForUpdates = showDialog => {
  ipc.callMain('check-for-updates', showDialog);
};

export const closeMailboxWindow = () => {
  ipc.callMain('close-mailbox');
};

export const generateLabelUUID = async () => {
  return await ipc.callMain('generate-label-uuid');
};

export const getOsAndArch = () => ipc.callMain('get-os-and-arch');

export const installUpdate = () => {
  ipc.callMain('install-update');
};

export const logoutApp = () => {
  ipc.callMain('logout-app');
};

export const maximizeMailboxWindow = () => {
  ipc.callMain('maximize-mailbox');
};

export const minimizeMailboxWindow = () => {
  ipc.callMain('minimize-mailbox');
};

export const openEmptyComposerWindow = () => {
  ipc.callMain('open-empty-composer');
};

export const openFilledComposerWindow = data => {
  ipc.callMain('open-filled-composer', data);
};

export const openFileExplorer = filename => {
  ipc.callMain('open-file-explorer', filename);
};

export const processPendingEvents = () => {
  setTimeout(() => {
    ipc.callMain('process-pending-events');
  }, 1000);
};

export const restartConnection = async jwt => {
  await ipc.callMain('restart-connection', jwt);
};

export const sendEndSyncDevicesEvent = async () => {
  await ipc.callMain('close-create-keys-loading');
  return await ipc.callMain('end-sync-mailbox-event');
};

export const sendEndLinkDevicesEvent = async () => {
  await ipc.callMain('end-link-devices-event');
  return await ipc.callMain('close-create-keys-loading');
};

export const sendOpenEmailSource = metadataKey => {
  ipc.callMain('open-email-source', metadataKey);
};

export const sendPrintEmailEvent = emailId => {
  ipc.callMain('print-to-pdf', { emailId });
};

export const sendPrintThreadEvent = threadId => {
  ipc.callMain('print-to-pdf', { threadId });
};

export const sendStartLinkDevicesEvent = data => {
  ipc.callMain('start-link-devices-event', data);
};

export const sendStartSyncDeviceEvent = data => {
  ipc.callMain('start-sync-mailbox-event', data);
};

export const showNotificationApp = ({ title, message, threadId }) => {
  ipc.callMain('show-notification', { title, message, threadId });
};

export const throwError = error => {
  ipc.callMain('throwError', error);
};

export const updateDockBadgeApp = value => {
  ipc.callMain('update-dock-badge', value);
};

/* File System
----------------------------- */
export const saveEmailBody = async params => {
  return await ipc.callMain('fs-save-email-body', params);
};

export const deleteEmailContent = async params => {
  return await ipc.callMain('fs-delete-email-content', params);
};

export const downloadFileInFileSystem = async ({
  url,
  filename,
  downloadType,
  metadataKey,
  filesize
}) => {
  return await ipc.callMain('fs-download-file', {
    url,
    filename,
    downloadType,
    metadataKey,
    filesize
  });
};

export const checkFileDownloaded = async ({ filename, metadataKey, type }) => {
  return await ipc.callMain('fs-check-file-downloaded', {
    filename,
    metadataKey,
    type
  });
};

/* Criptext Client
----------------------------- */
export const acknowledgeEvents = async eventIds => {
  return await ipc.callMain('client-acknowledge-events', eventIds);
};

export const changePassword = async params => {
  return await ipc.callMain('client-change-password', params);
};

export const changeRecoveryEmail = async params => {
  return await ipc.callMain('client-change-recovery-email', params);
};

export const checkExpiredSession = async params => {
  return await ipc.callMain('client-check-expired-session', params);
};

export const deleteMyAccount = async password => {
  return await ipc.callMain('client-delete-my-account', password);
};

export const getUserSettings = async () => {
  return await ipc.callMain('client-get-user-settings');
};

export const insertPreKeys = async preKeys => {
  return await ipc.callMain('client-insert-prekeys', preKeys);
};

export const logout = async () => {
  return await ipc.callMain('client-logout');
};

export const postPeerEvent = async params => {
  return await ipc.callMain('client-post-peer-event', params);
};

export const removeAvatar = async params => {
  return await ipc.callMain('client-remove-avatar', params);
};

export const removeDevice = async params => {
  return await ipc.callMain('client-remove-device', params);
};

export const resendConfirmationEmail = async () => {
  return await ipc.callMain('client-resend-confirmation-email');
};

export const resetPassword = async recipientId => {
  return await ipc.callMain('client-reset-password', recipientId);
};

export const setReadTracking = async enabled => {
  return await ipc.callMain('client-set-read-tracking', enabled);
};

export const setReplyTo = async params => {
  return await ipc.callMain('client-set-reply-to', params);
};

export const setTwoFactorAuth = async enable => {
  return await ipc.callMain('client-set-two-factor-auth', enable);
};

export const syncBegin = async () => {
  return await ipc.callMain('client-sync-begin');
};

export const syncCancel = async () => {
  return await ipc.callMain('client-sync-cancel');
};

export const syncStatus = async () => {
  return await ipc.callMain('client-sync-status');
};

export const unlockDevice = async params => {
  return await ipc.callMain('client-unlock-device', params);
};

export const unsendEmailEvent = async metadataKey => {
  return await ipc.callMain('client-unsend-email', metadataKey);
};

export const updateDeviceType = async newDeviceType => {
  return await ipc.callMain('client-update-device-type', newDeviceType);
};

export const updateNameEvent = async params => {
  return await ipc.callMain('client-update-name-event', params);
};

export const updatePushToken = async pushToken => {
  return await ipc.callMain('client-update-push-token', pushToken);
};

export const uploadAvatar = async params => {
  return await ipc.callMain('client-upload-avatar', params);
};

/*  DataBase
----------------------------- */
export const cleanDatabase = async () => {
  return await ipc.callMain('db-clean-database');
};

export const cleanDataLogout = async recipientId => {
  return await ipc.callMain('db-clean-data-logout', recipientId);
};

export const createEmail = async params => {
  return await ipc.callMain('db-create-email', params);
};

export const createEmailLabel = async params => {
  return await ipc.callMain('db-create-email-label', params);
};

export const createFeedItem = async params => {
  return await ipc.callMain('db-create-feed-item', params);
};

export const createIdentityKeyRecord = async params => {
  return await ipc.callMain('db-create-identity-key-record', params);
};

export const createLabel = async params => {
  return await ipc.callMain('db-create-label', params);
};

export const createPreKeyRecord = async params => {
  return await ipc.callMain('db-create-prekey-record', params);
};

export const createSessionRecord = async params => {
  return await ipc.callMain('db-create-session-record', params);
};

export const createSignalTables = async () => {
  return await ipc.callMain('db-create-signal-tables');
};

export const createSignedPreKeyRecord = async params => {
  return await ipc.callMain('db-create-signed-prekey-record', params);
};

export const deleteEmailByKeys = async keys => {
  return await ipc.callMain('db-delete-email-by-keys', keys);
};

export const deleteEmailLabel = async params => {
  return await ipc.callMain('db-delete-email-label', params);
};

export const deleteEmailsByIds = async ids => {
  return await ipc.callMain('db-delete-emails-by-ids', ids);
};

export const deleteEmailsByThreadIdAndLabelId = async ({
  threadIds,
  labelId
}) => {
  return await ipc.callMain('db-delete-emails-by-threadid-and-labelid', {
    threadIds,
    labelId
  });
};

export const deleteFeedItemById = async feedItemId => {
  return await ipc.callMain('db-delete-feed-item-by-id', feedItemId);
};

export const deleteLabelById = async labelId => {
  return await ipc.callMain('db-delete-label-by-id', labelId);
};

export const deletePreKeyPair = async params => {
  return await ipc.callMain('db-delete-prekey-pair', params);
};

export const deleteSessionRecord = async params => {
  return await ipc.callMain('db-delete-session-record', params);
};

export const getAccount = async () => {
  return await ipc.callMain('db-get-account');
};

export const getAllFeedItems = async () => {
  return await ipc.callMain('db-get-all-feed-items');
};

export const getDataReady = async () => {
  return await ipc.callMain('client-get-data-ready');
};

export const getAllLabels = async () => {
  return await ipc.callMain('db-get-all-labels');
};

export const getContactByEmails = async emails => {
  return await ipc.callMain('db-get-contact-by-emails', emails);
};

export const getContactByIds = async ids => {
  return await ipc.callMain('db-get-contact-by-ids', ids);
};

export const getEmailByKey = async key => {
  return await ipc.callMain('db-get-email-by-key', key);
};

export const getEmailByParams = async params => {
  return await ipc.callMain('db-get-email-by-params', params);
};

export const getEmailLabelsByEmailId = async emailId => {
  return await ipc.callMain('db-get-email-labels-by-emailid', emailId);
};

export const getEmailsByArrayParam = async emailIds => {
  return await ipc.callMain('db-get-emails-by-array-param', emailIds);
};

export const getEmailsByIds = async emailIds => {
  return await ipc.callMain('db-get-emails-by-ids', emailIds);
};

export const getEmailsByLabelIds = async labelIds => {
  return await ipc.callMain('db-get-emails-by-labelids', labelIds);
};

export const getEmailsByThreadId = async params => {
  return await ipc.callMain('db-get-emails-by-threadid', params);
};

export const getEmailsByThreadIdAndLabelId = async ({ threadIds, labelId }) => {
  return await ipc.callMain('db-get-emails-by-threadid-and-labelid', {
    threadIds,
    labelId
  });
};

export const getEmailsCounterByLabelId = async labelId => {
  return await ipc.callMain('db-get-emails-counter-by-labelid', labelId);
};

export const getEmailsGroupByThreadByParams = async params => {
  return await ipc.callMain('db-get-emails-group-by-thread-by-params', params);
};

export const getEmailsUnredByLabelId = async params => {
  return await ipc.callMain('db-get-emails-unread-by-labelid', params);
};

export const getFilesByTokens = async tokens => {
  return await ipc.callMain('db-get-files-by-tokens', tokens);
};

export const getFeedItemsCounterBySeen = async seen => {
  return await ipc.callMain('db-get-feeditems-counter-by-seen', seen);
};

export const getIdentityKeyRecord = async params => {
  return await ipc.callMain('db-get-identity-key-record', params);
};

export const getLabelById = async id => {
  return await ipc.callMain('db-get-labelid', id);
};

export const getLabelsByText = async text => {
  return await ipc.callMain('db-get-labesls-by-text', text);
};

export const getLabelByUuid = async uuid => {
  return await ipc.callMain('db-get-label-by-uuid', uuid);
};

export const getPreKeyPair = async params => {
  return await ipc.callMain('db-get-prekey-pair', params);
};

export const getSessionRecord = async params => {
  return await ipc.callMain('db-get-session-record', params);
};

export const getSessionRecordIds = async () => {
  return await ipc.callMain('db-get-prekeys-ids');
};

export const getSignedPreKey = async params => {
  return await ipc.callMain('db-get-signed-prekey', params);
};

export const getTrashExpiredEmails = async () => {
  return await ipc.callMain('db-get-trash-expired-emails');
};

export const unsendEmail = async params => {
  return await ipc.callMain('db-unsend-email', params);
};

export const updateAccount = async params => {
  return await ipc.callMain('db-update-account', params);
};

export const updateContactByEmail = async ({ email, name }) => {
  return await ipc.callMain('db-update-contact-by-email', { email, name });
};

export const updateContactSpamScore = async params => {
  return await ipc.callMain('db-update-contact-spam-acore', params);
};

export const updateEmail = async params => {
  return await ipc.callMain('db-update-email', params);
};

export const updateEmails = async params => {
  return await ipc.callMain('db-update-emails', params);
};

export const updateFeedItems = async params => {
  return await ipc.callMain('db-update-feed-items', params);
};

export const updateFilesByEmailId = async ({ emailId, status }) => {
  return await ipc.callMain('db-update-files-by-emailid', { emailId, status });
};

export const updateIdentityKeyRecord = async params => {
  return await ipc.callMain('db-update-identity-key-record', params);
};

export const updateLabel = async params => {
  return await ipc.callMain('db-update-label', params);
};

export const updateSettings = async params => {
  return await ipc.callMain('db-update-settings', params);
};

export const updateUnreadEmailByThreadIds = async ({ threadIds, unread }) => {
  return await ipc.callMain('db-update-unread-email-by-threadids', {
    threadIds,
    unread
  });
};

/* DataTransfer
----------------------------- */
export const downloadBackupFile = async address => {
  return await ipc.callMain('data-transfer-download', address);
};

export const decryptBackupFile = async key => {
  return await ipc.callMain('data-transfer-decrypt', key);
};

export const importDatabase = async () => {
  return await ipc.callMain('data-transfer-import');
};

export const clearSyncData = async () => {
  return await ipc.callMain('data-transfer-clear-sync-data');
};

/* Backup
----------------------------- */
export const createDefaultBackupFolder = async () => {
  return await ipc.callMain('create-default-backup-folder');
};

export const exportBackupUnencrypted = async params => {
  return await ipc.callMain('export-backup-unencrypted', params);
};

export const exportBackupEncrypted = async params => {
  return await ipc.callMain('export-backup-encrypted', params);
};

export const getDefaultBackupFolder = async () => {
  return await ipc.callMain('get-default-backup-folder');
};

export const initAutoBackupMonitor = async () => {
  return await ipc.callMain('init-autobackup-monitor');
};

export const restoreBackupEncrypted = async params => {
  return await ipc.callMain('restore-backup-encrypted', params);
};

export const restoreBackupUnencrypted = async params => {
  return await ipc.callMain('restore-backup-unencrypted', params);
};

/* Nucleus
----------------------------- */
export const reportContentUnencrypted = async error => {
  return await ipc.callMain('nucleups-report-content-unencrypted', error);
};
