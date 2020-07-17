import ipc from '@criptext/electron-better-ipc/renderer';

/* Logger Call
----------------------------- */
export const logError = stack => {
  ipc.callMain('log-error', stack);
};

/*  Windows call
----------------------------- */
export const changeAccountApp = async accountId => {
  return await ipc.callMain('change-account-app', accountId);
};

export const checkForUpdates = showDialog => {
  ipc.callMain('check-for-updates', showDialog);
};

export const checkPin = async () => {
  return await ipc.callMain('check-pin');
};

export const closeMailboxWindow = () => {
  ipc.callMain('close-mailbox');
};

export const focusMailbox = () => {
  ipc.callMain('focus-mailbox');
};

export const generateLabelUUID = async () => {
  return await ipc.callMain('generate-label-uuid');
};

export const getComputerName = () => ipc.callMain('get-computer-name');

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

export const openLoginWindow = () => {
  ipc.callMain('open-login');
};

export const processPendingEvents = params => {
  setTimeout(() => {
    ipc.callMain('process-pending-events', params);
  }, 1000);
};

export const restartConnection = async jwt => {
  await ipc.callMain('restart-connection', jwt);
};

export const restartAlice = async () => {
  return await ipc.callMain('restart-alice');
};

export const restartApp = () => ipc.callMain('restart-app');

export const sendEndSyncDevicesEvent = async () => {
  await ipc.callMain('close-create-keys-loading');
  return await ipc.callMain('end-sync-mailbox-event');
};

export const sendEndLinkDevicesEvent = async () => {
  await ipc.callMain('end-link-devices-event');
  return await ipc.callMain('close-create-keys-loading');
};

export const sendOpenEmailSource = params => {
  ipc.callMain('open-email-source', params);
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

export const showNotificationApp = params => {
  ipc.callMain('show-notification', params);
};

export const startRekey = params => {
  ipc.callMain('reset-key-initialize', params);
};

export const throwError = error => {
  ipc.callMain('throwError', error);
};

export const updateDockBadgeApp = value => {
  ipc.callMain('update-dock-badge', value);
};

export const validatePin = async pin => {
  return await ipc.callMain('validate-pin', pin);
};

/* File System
----------------------------- */

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

export const storeRecoveryKey = async params => {
  return await ipc.callMain('store-recovery-key', params);
};

/* Criptext Client
----------------------------- */
export const activateAddress = async params => {
  return await ipc.callMain('client-activate-address', params);
};
export const acknowledgeEvents = async params => {
  return await ipc.callMain('client-acknowledge-events', params);
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

export const deleteAddress = async addressId => {
  return await ipc.callMain('client-delete-address', addressId);
};

export const deleteDomain = async domain => {
  return await ipc.callMain('client-delete-domain', domain);
};

export const deleteMyAccount = async params => {
  return await ipc.callMain('client-delete-my-account', params);
};

export const getDomainMX = async domain => {
  return await ipc.callMain('client-get-domain-mx', domain);
};

export const getUserSettings = async recipientId => {
  return await ipc.callMain('client-get-user-settings', recipientId);
};

export const insertPreKeys = async params => {
  return await ipc.callMain('client-insert-prekeys', params);
};

export const isDomainAvailable = async domain => {
  return await ipc.callMain('client-domain-available', domain);
};

export const logout = async () => {
  return await ipc.callMain('client-logout');
};

export const postPeerEvent = async params => {
  return await ipc.callMain('client-post-peer-event', params);
};

export const reencryptEmail = async params => {
  return await ipc.callMain('client-reencrypt-email', params);
};

export const registerDomain = async domain => {
  return await ipc.callMain('client-register-domain', domain);
};

export const removeAvatar = async params => {
  return await ipc.callMain('client-remove-avatar', params);
};

export const removeDevice = async params => {
  return await ipc.callMain('client-remove-device', params);
};

export const reportPhishing = async params => {
  return await ipc.callMain('client-report-phishing', params);
};

export const resendConfirmationEmail = async () => {
  return await ipc.callMain('client-resend-confirmation-email');
};

export const resetPassword = async recipientId => {
  return await ipc.callMain('client-reset-password', recipientId);
};

export const setAddress = async params => {
  return await ipc.callMain('client-set-address', params);
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

export const setBlockRemoteContent = async enable => {
  return await ipc.callMain('client-set-block-remote-content', enable);
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

export const validateDomainMX = async domain => {
  return await ipc.callMain('client-validate-mx-records', domain);
};

/*  DataBase
----------------------------- */
export const cleanDatabase = async recipientId => {
  return await ipc.callMain('db-clean-database', recipientId);
};

export const cleanDataLogout = async params => {
  return await ipc.callMain('db-clean-data-logout', params);
};

export const createAlias = async params => {
  return await ipc.callMain('db-create-alias', params);
};

export const createCustomDomain = async params => {
  return await ipc.callMain('db-create-custom-domain', params);
};

export const changeEmailBlockedAccount = async params => {
  return await ipc.callMain('db-change-account-blocked', params);
};

export const changeEmailBlockedContact = async params => {
  return await ipc.callMain('db-change-contact-blocked', params);
};

export const getAlias = async params => {
  return await ipc.callMain('db-get-alias-by-params', params);
};

export const getCustomDomainByParams = async params => {
  return await ipc.callMain('db-get-custom-domains-by-params', params);
};

export const getCustomDomain = async params => {
  return await ipc.callMain('db-get-custom-domains-by-params', params);
};

export const createOrUpdateContact = async params => {
  return await ipc.callMain('db-create-update-contact', params);
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

export const createSignedPreKeyRecord = async params => {
  return await ipc.callMain('db-create-signed-prekey-record', params);
};

export const deleteEmailByKeys = async params => {
  return await ipc.callMain('db-delete-email-by-keys', params);
};

export const deleteAliases = async params => {
  return await ipc.callMain('db-delete-alias', params);
};

export const deleteAliasesByDomain = async params => {
  return await ipc.callMain('db-delete-aliases-by-domain', params);
};

export const deleteCustomDomainByName = async params => {
  return await ipc.callMain('db-delete-custom-domains-by-name', params);
};

export const deleteCustomDomains = async domains => {
  return await ipc.callMain('db-delete-custom-domains', { domains });
};

export const deleteEmailLabel = async params => {
  return await ipc.callMain('db-delete-email-label', params);
};

export const deleteEmailsByIds = async params => {
  return await ipc.callMain('db-delete-emails-by-ids', params);
};

export const deleteEmailsByThreadIdAndLabelId = async params => {
  return await ipc.callMain('db-delete-emails-by-threadid-and-labelid', params);
};

export const deleteFeedItemById = async feedItemId => {
  return await ipc.callMain('db-delete-feed-item-by-id', feedItemId);
};

export const deleteLabelById = async params => {
  return await ipc.callMain('db-delete-label-by-id', params);
};

export const deletePreKeyPair = async params => {
  return await ipc.callMain('db-delete-prekey-pair', params);
};

export const deleteSessionRecord = async params => {
  return await ipc.callMain('db-delete-session-record', params);
};

export const getAccountByParams = async params => {
  return await ipc.callMain('db-get-account-by-params', params);
};

export const getAllFeedItems = async params => {
  return await ipc.callMain('db-get-all-feed-items', params);
};

export const getDataReady = async recipientId => {
  return await ipc.callMain('client-get-data-ready', recipientId);
};

export const getAllLabels = async params => {
  return await ipc.callMain('db-get-all-labels', params);
};

export const getContactByEmails = async params => {
  return await ipc.callMain('db-get-contact-by-emails', params);
};

export const getContactByIds = async ids => {
  return await ipc.callMain('db-get-contact-by-ids', ids);
};

export const getEmailByKey = async params => {
  return await ipc.callMain('db-get-email-by-key', params);
};

export const getEmailByParams = async params => {
  return await ipc.callMain('db-get-email-by-params', params);
};

export const getEmailLabelsByEmailId = async emailId => {
  return await ipc.callMain('db-get-email-labels-by-emailid', emailId);
};

export const getEmailsByArrayParam = async params => {
  return await ipc.callMain('db-get-emails-by-array-param', params);
};

export const getEmailsByIds = async params => {
  return await ipc.callMain('db-get-emails-by-ids', params);
};

export const getEmailsByLabelIds = async params => {
  return await ipc.callMain('db-get-emails-by-labelids', params);
};

export const getEmailsByThreadId = async params => {
  return await ipc.callMain('db-get-emails-by-threadid', params);
};

export const getEmailsIdsByThreadIds = async params => {
  return await ipc.callMain('db-get-emailsIds-by-threadids', params);
};

export const getEmailsByThreadIdAndLabelId = async params => {
  return await ipc.callMain('db-get-emails-by-threadid-and-labelid', params);
};

export const getEmailsCounterByLabelId = async params => {
  return await ipc.callMain('db-get-emails-counter-by-labelid', params);
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

export const getFeedItemsCounterBySeen = async params => {
  return await ipc.callMain('db-get-feeditems-counter-by-seen', params);
};

export const getIdentityKeyRecord = async params => {
  return await ipc.callMain('db-get-identity-key-record', params);
};

export const getLabelById = async id => {
  return await ipc.callMain('db-get-labelid', id);
};

export const getLabelsByText = async params => {
  return await ipc.callMain('db-get-labesls-by-text', params);
};

export const getLabelByUuid = async params => {
  return await ipc.callMain('db-get-label-by-uuid', params);
};

export const getPreKeyPair = async params => {
  return await ipc.callMain('db-get-prekey-pair', params);
};

export const getSessionRecord = async params => {
  return await ipc.callMain('db-get-session-record', params);
};

export const getSessionRecordIds = async params => {
  return await ipc.callMain('db-get-prekeys-ids', params);
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

export const updateAccountDefaultAddress = async params => {
  return await ipc.callMain('db-update-account-default-address', params);
};

export const updateAlias = async params => {
  return await ipc.callMain('db-update-alias', params);
};

export const updateContactByEmail = async ({ email, name, isTrusted }) => {
  return await ipc.callMain('db-update-contact-by-email', {
    email,
    name,
    isTrusted
  });
};

export const updateContactSpamScore = async params => {
  return await ipc.callMain('db-update-contact-spam-acore', params);
};

export const updateCustomDomain = async params => {
  return await ipc.callMain('db-update-custom-domains', params);
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

export const updateUnreadEmailByThreadIds = async params => {
  return await ipc.callMain('db-update-unread-email-by-threadids', params);
};

/* DataTransfer
----------------------------- */
export const downloadBackupFile = async address => {
  return await ipc.callMain('data-transfer-download', address);
};

export const decryptBackupFile = async key => {
  return await ipc.callMain('data-transfer-decrypt', key);
};

export const importDatabase = async params => {
  return await ipc.callMain('data-transfer-import', params);
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

export const disableAutoBackup = async accountId => {
  return await ipc.callMain('disable-auto-backup', accountId);
};

/* Nucleus
----------------------------- */
export const reportContentUnencrypted = async error => {
  return await ipc.callMain('nucleups-report-content-unencrypted', error);
};

export const reportContentUnencryptedBob = async error => {
  return await ipc.callMain('nucleups-report-content-unencrypted-bob', error);
};

export const reportUncaughtError = async error => {
  return await ipc.callMain('nucleups-report-uncaught-error', error);
};
