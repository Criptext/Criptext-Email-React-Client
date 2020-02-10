import ipc from '@criptext/electron-better-ipc/renderer';

export const closeCreatingKeysLoadingWindow = () => {
  ipc.callMain('close-create-keys-loading');
};

export const getComputerName = () => ipc.callMain('get-computer-name');

export const openMailboxWindow = () => {
  ipc.callMain('open-mailbox', { firstOpenApp: true });
};

export const openPinWindow = params => {
  ipc.callMain('open-pin', params);
};

export const logoutApp = () => {
  ipc.callMain('logout-app');
};

export const throwError = error => {
  ipc.callMain('throwError', error);
};

export const sendEndLinkDevicesEvent = () => {
  ipc.callMain('end-link-devices-event');
};

export const getSystemLanguage = async () => {
  return await ipc.callMain('get-system-language');
};

export const restartAlice = async () => {
  return await ipc.callMain('restart-alice');
};

/* Criptext Client
----------------------------- */
export const acknowledgeEvents = async eventIds => {
  return await ipc.callMain('client-acknowledge-events', eventIds);
};

export const getDataReady = async () => {
  return await ipc.callMain('client-get-data-ready');
};

export const getKeyBundle = async deviceId => {
  return await ipc.callMain('client-get-key-bundle', deviceId);
};

export const linkAccept = async randomId => {
  return await ipc.callMain('client-link-accept', randomId);
};

export const linkDeny = async randomId => {
  return await ipc.callMain('client-link-deny', randomId);
};

export const postDataReady = async params => {
  return await ipc.callMain('client-post-data-ready', params);
};

export const postKeyBundle = async params => {
  return await ipc.callMain('client-post-key-bundle', params);
};

export const postUser = async params => {
  return await ipc.callMain('client-post-user', params);
};

export const syncAccept = async randomId => {
  return await ipc.callMain('client-sync-accept', randomId);
};

export const syncDeny = async randomId => {
  return await ipc.callMain('client-sync-deny', randomId);
};

/* DataBase
----------------------------- */
export const cleanDatabase = async username => {
  return await ipc.callMain('db-clean-database', username);
};

export const cleanKeys = async username => {
  return await ipc.callMain('db-clean-keys', username);
};

export const createContact = async params => {
  return await ipc.callMain('db-create-contact', params);
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

export const createSettings = async params => {
  return await ipc.callMain('db-create-settings', params);
};

export const createSignedPreKeyRecord = async params => {
  return await ipc.callMain('db-create-signed-prekey-record', params);
};

export const createTables = async () => {
  return await ipc.callMain('db-create-tables');
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

export const getAccountByParams = async () => {
  return await ipc.callMain('db-get-account-by-params');
};

export const getContactByEmails = async emails => {
  return await ipc.callMain('db-get-contact-by-emails', emails);
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

export const getSignedPreKey = async params => {
  return await ipc.callMain('db-get-signed-prekey', params);
};

export const updateAccount = async params => {
  return await ipc.callMain('db-update-account', params);
};

export const updateIdentityKeyRecord = async params => {
  return await ipc.callMain('db-update-identity-key-record', params);
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

export const exportDatabase = async () => {
  return await ipc.callMain('data-transfer-export-database');
};

export const encryptDatabaseFile = async () => {
  return await ipc.callMain('data-transfer-encrypt');
};

export const uploadDatabaseFile = async randomId => {
  return await ipc.callMain('data-transfer-upload', randomId);
};
