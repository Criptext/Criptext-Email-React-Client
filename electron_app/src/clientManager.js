const ClientAPI = require('@criptext/api');
const {
  APP_DOMAIN,
  SERVER_URL,
  API_CLIENT_VERSION,
  LINK_DEVICES_FILE_VERSION
} = require('./utils/const');
const dbManager = require('./database');
const { processEventsQueue } = require('./eventQueueManager');
const globalManager = require('./globalManager');
const mailboxWindow = require('./windows/mailbox');
const socketClient = require('./socketClient');
const packageInfo = require('./../package.json');
const appVersion = packageInfo.version;
const { getOsAndArch } = require('./utils/osUtils');
const { Readable } = require('stream');
const nativeImage = require('electron').nativeImage;
const mySettings = require('./Settings');
const clientsMap = new Map();

const initializeClient = ({
  recipientId,
  token,
  refreshToken,
  language,
  os
}) => {
  const client = new ClientAPI({
    os,
    token,
    language,
    appVersion,
    refreshToken,
    url: SERVER_URL,
    timeout: 60 * 1000,
    version: API_CLIENT_VERSION,
    errorCallback: handleClientError
  });
  clientsMap[recipientId] = client;
  return client;
};

const handleClientError = err => {
  const NO_INTERNET_CONNECTION_CODE = 'ENOTFOUND';
  if (err.code === NO_INTERNET_CONNECTION_CODE) {
    mailboxWindow.send('lost-network-connection', null);
  } else {
    throw err;
  }
};

const createClient = async ({ recipientId, optionalToken }) => {
  const client = clientsMap[recipientId];
  if (client) return client;
  const language = mySettings.language;
  const osAndArch = await getOsAndArch();
  const osInfo = Object.values(osAndArch)
    .filter(val => !!val)
    .join(' ');
  if (optionalToken) {
    return initializeClient({
      recipientId,
      token: optionalToken,
      language,
      os: osInfo
    });
  }
  const [account] = await dbManager.getAccountByParams({ recipientId });
  const [token, refreshToken] = account
    ? [account.jwt, account.refreshToken]
    : [undefined, undefined];
  return initializeClient({
    recipientId,
    token,
    refreshToken,
    language,
    os: osInfo
  });
};

const getRecipientId = data => {
  const { recipientId, domain } = data;
  return domain === APP_DOMAIN ? recipientId : `${recipientId}@${domain}`;
};

const checkExpiredSession = async (
  requirementResponse,
  initialRequest,
  requestparams
) => {
  const NEW_SESSION_SUCCESS_STATUS = 200;
  const UPDATE_USER_TOKENS = 201;
  const EXPIRED_SESSION_STATUS = 401;
  const CHANGED_PASSWORD_STATUS = 403;
  const SUSPENDED_ACCOUNT_REQ_STATUS = 451;

  const status = requirementResponse.status;
  const accountRecipientId =
    typeof requestparams === 'object'
      ? requestparams.recipientId
      : requestparams;
  const [existingAccount] = accountRecipientId
    ? await dbManager.getAccountByParams({
        recipientId: accountRecipientId
      })
    : await dbManager.getAccountByParams({ isActive: true });

  if (!existingAccount) return requirementResponse;

  const { recipientId, refreshToken } = existingAccount;

  switch (status) {
    case CHANGED_PASSWORD_STATUS: {
      mailboxWindow.send('password-changed', recipientId);
      return { status: CHANGED_PASSWORD_STATUS };
    }
    case SUSPENDED_ACCOUNT_REQ_STATUS: {
      mailboxWindow.send('suspended-account', recipientId);
      return { status: SUSPENDED_ACCOUNT_REQ_STATUS };
    }
    case EXPIRED_SESSION_STATUS: {
      let newSessionToken, newRefreshToken, newSessionStatus;
      const client = await createClient({ recipientId });
      if (!refreshToken) {
        const { status, body } = await upgradeToRefreshToken(client);
        newSessionStatus = status;
        newSessionToken = body.token;
        newRefreshToken = body.refreshToken;
      } else {
        const { status, body, text } = await client.refreshSession();
        newSessionStatus = status;
        if (newSessionStatus === NEW_SESSION_SUCCESS_STATUS) {
          newSessionToken = text;
        } else if (newSessionStatus === UPDATE_USER_TOKENS) {
          newSessionToken = body.token;
          newRefreshToken = body.refreshToken;
        }
      }

      if (newSessionStatus === EXPIRED_SESSION_STATUS) {
        mailboxWindow.send('device-removed', recipientId);
        return { status: newSessionStatus };
      }

      if (
        newSessionStatus === NEW_SESSION_SUCCESS_STATUS ||
        newSessionStatus === UPDATE_USER_TOKENS
      ) {
        await dbManager.updateAccount({
          jwt: newSessionToken,
          refreshToken: newRefreshToken,
          recipientId
        });
        if (client.token) client.token = newSessionToken;
        socketClient.add([{ recipientId, jwt: newSessionToken }]);
        if (initialRequest) {
          return await initialRequest(requestparams);
        }
      }
      return requirementResponse;
    }
    default: {
      return requirementResponse;
    }
  }
};

const activateAddress = async ({rowId, active}) => {
  console.log('YAS : ', rowId, active);
  const res = await client.activateAddress(rowId, active);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, activateAddress, {rowId, active});
}

const acknowledgeEvents = async params => {
  const { eventIds, recipientId } = params;
  const client = await createClient({ recipientId });
  const res = await client.acknowledgeEvents(eventIds);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, acknowledgeEvents, params);
};

const canLogin = async ({ username, domain }) => {
  const recipientId = getRecipientId({ recipientId: username, domain });
  const client = await createClient({
    recipientId,
    optionalToken: '@'
  });
  return await client.canLogin({ username, domain });
};

const changeRecoveryEmail = async params => {
  const { recipientId } = params;
  const client = await createClient({ recipientId });
  const res = await client.changeRecoveryEmail(params);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, changeRecoveryEmail, params);
};

const changePassword = async params => {
  const { recipientId } = params;
  const client = await createClient({ recipientId });
  const res = await client.changePassword(params);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, changePassword, params);
};

const checkAvailableUsername = async username => {
  const client = await createClient({
    recipientId: username,
    optionalToken: '@'
  });
  return await client.checkAvailableUsername(username);
};

const deleteDeviceToken = async params => {
  const recipientId = getRecipientId(params);
  const client = await createClient({
    recipientId,
    optionalToken: '@'
  });
  const res = await client.deleteDeviceToken(params);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, deleteDeviceToken, params);
};

const deleteMyAccount = async params => {
  const { recipientId, password } = params;
  const client = await createClient({ recipientId });
  const res = await client.deleteMyAccount(password);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, deleteMyAccount, params);
};

const findDevices = async params => {
  const recipientId = getRecipientId(params);
  const client = await createClient({
    recipientId,
    optionalToken: '@'
  });
  const res = await client.findDevices(params);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, findDevices, params);
};

const findKeyBundles = async params => {
  const { recipientId } = params;
  const client = await createClient({ recipientId });
  const res = await client.findKeyBundles(params);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, findKeyBundles, params);
};

const generateEvent = async params => {
  const { event, recipientId } = params;
  const client = await createClient({ recipientId });
  await client.generateUserEvent(event);
};

const getDataReady = async recipientId => {
  const client = await createClient({ recipientId });
  const res = await client.getDataReady();
  return res.status === 200
    ? res
    : await checkExpiredSession(res, getDataReady, recipientId);
};

const getKeyBundle = async params => {
  const { deviceId, recipientId } = params;
  const client = await createClient({ recipientId });
  const res = await client.getKeyBundle(deviceId);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, getKeyBundle, params);
};

const getUserSettings = async recipientId => {
  const client = await createClient({ recipientId });
  const res = await client.getUserSettings();
  return res.status === 200
    ? parseUserSettings(res.body)
    : await checkExpiredSession(res, getUserSettings, recipientId);
};

const parseUserSettings = settings => {
  const { devices, general, addresses } = settings;
  const {
    recoveryEmail,
    recoveryEmailConfirmed,
    replyTo,
    twoFactorAuth,
    trackEmailRead
  } = general;
  return {
    devices,
    addresses,
    twoFactorAuth: !!twoFactorAuth,
    recoveryEmail,
    recoveryEmailConfirmed: !!recoveryEmailConfirmed,
    readReceiptsEnabled: !!trackEmailRead,
    replyTo: replyTo
  };
};

const insertPreKeys = async ({ preKeys, recipientId, optionalToken }) => {
  const client = await createClient({ recipientId, optionalToken });
  return await client.insertPreKeys(preKeys);
};

const isCriptextDomain = async params => {
  const { domains, recipientId } = params;
  const client = await createClient({ recipientId });
  const res = await client.isCriptextDomain(domains);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, isCriptextDomain, params);
};

const linkAccept = async params => {
  const { randomId, recipientId } = params;
  const client = await createClient({ recipientId });
  const data = { randomId, recipientId, version: LINK_DEVICES_FILE_VERSION };
  const res = await client.linkAccept(data);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, linkAccept, data);
};

const linkAuth = async ({ newDeviceData, jwt }) => {
  const recipientId = getRecipientId(newDeviceData);
  const client = await createClient({ recipientId, optionalToken: jwt });
  return await client.linkAuth(newDeviceData);
};

const linkCancel = async ({ newDeviceData, jwt }) => {
  const recipientId = getRecipientId(newDeviceData);
  const client = await createClient({ recipientId, optionalToken: jwt });
  return await client.linkCancel(newDeviceData);
};

const linkBegin = async ({ username, domain }) => {
  const data = {
    targetUsername: username,
    domain,
    version: LINK_DEVICES_FILE_VERSION
  };

  const recipientId = getRecipientId({ recipientId: username, domain });
  const client = await createClient({
    recipientId,
    optionalToken: '@'
  });
  return await client.linkBegin(data);
};

const linkDeny = async params => {
  const { randomId, recipientId } = params;
  const client = await createClient({ recipientId });
  const res = await client.linkDeny(randomId);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, linkDeny, params);
};

const linkStatus = async recipientId => {
  const client = await createClient({ recipientId });
  const res = await client.linkStatus();
  return res.status === 200
    ? res
    : await checkExpiredSession(res, linkStatus, recipientId);
};

const login = async data => {
  const { username, domain } = data;
  const recipientId = getRecipientId({ recipientId: username, domain });
  const client = await createClient({
    recipientId,
    optionalToken: '@'
  });
  return await client.login(data);
};

const loginFirst = async data => {
  const { username, domain } = data;
  const recipientId = getRecipientId({ recipientId: username, domain });
  const client = await createClient({
    recipientId,
    optionalToken: '@'
  });
  return await client.loginFirst(data);
};

const logout = async recipientId => {
  const client = await createClient({ recipientId });
  const res = await client.logout();
  if (res.status === 200) delete clientsMap[recipientId];
  return res.status === 200
    ? res
    : await checkExpiredSession(res, logout, recipientId);
};

const postDataReady = async params => {
  const { recipientId } = params;
  const client = await createClient({ recipientId });
  const res = await client.postDataReady(params);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, postDataReady, params);
};

const postEmail = async params => {
  const { recipientId } = params;
  const client = await createClient({ recipientId });
  const res = await client.postEmail(params);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, postEmail, params);
};

const postKeyBundle = async params => {
  const { recipientId } = params;
  const client = await createClient({ recipientId });
  const res = await client.postKeyBundle(params);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, postKeyBundle, params);
};

const postPeerEvent = async ({ data, accountId, recipientId }) => {
  try {
    await dbManager.createPendingEvent({
      data: JSON.stringify(data),
      accountId
    });
    processEventsQueue({ accountId, recipientId });
    return Promise.resolve({ status: 200 });
  } catch (e) {
    return Promise.reject({ status: 422 });
  }
};

const pushPeerEvents = async params => {
  try {
    const { events, recipientId } = params;
    const client = await createClient({ recipientId });
    const res = await client.postPeerEvent({
      peerEvents: [...events]
    });
    return res.status === 200
      ? res
      : await checkExpiredSession(res, pushPeerEvents, params);
  } catch (e) {
    if (e.code === 'ENOTFOUND') {
      globalManager.internetConnection.setStatus(false);
      return Promise.resolve({ status: 200 });
    }
    return Promise.reject({ status: 422 });
  }
};

const postUser = async params => {
  const { recipientId } = params;
  const client = await createClient({ recipientId, optionalToken: '@' });
  return await client.postUser(params);
};

const removeAvatar = async recipientId => {
  const client = await createClient({ recipientId });
  return await client.deleteAvatar();
};

const removeDevice = async params => {
  const { recipientId } = params;
  const client = await createClient({ recipientId });
  const res = await client.removeDevice(params);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, removeDevice, params);
};

const reportPhishing = async params => {
  const { recipientId } = params;
  const client = await createClient({ recipientId });
  const res = await client.reportContact(params);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, reportPhishing, params);
};

const resendConfirmationEmail = async recipientId => {
  const client = await createClient({ recipientId });
  const res = await client.resendConfirmationEmail();
  return res.status === 200
    ? res
    : await checkExpiredSession(res, resendConfirmationEmail, recipientId);
};

const resetPassword = async params => {
  const recipientId = getRecipientId(params);
  const client = await createClient({
    recipientId
  });
  const res = await client.resetPassword(params);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, resetPassword, params);
};

const setAddress = async params => {
  const res = await client.setAddress(params.username, params.domain);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, setAddress, params);
};

const sendRecoveryCode = async ({ newDeviceData, jwt }) => {
  const recipientId = getRecipientId(newDeviceData);
  const client = await createClient({ recipientId, optionalToken: jwt });
  const res = await client.generateCodeTwoFactorAuth(newDeviceData);
  return res;
};

const setReadTracking = async params => {
  const { recipientId, enabled } = params;
  const client = await createClient({ recipientId });
  const res = await client.setReadTracking(enabled);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, setReadTracking, params);
};

const setReplyTo = async params => {
  const { recipientId } = params;
  const client = await createClient({ recipientId });
  const res = await client.setReplyTo(params);
  return res.status === 200
    ? { status: res.status }
    : await checkExpiredSession(res, setReplyTo, params);
};

const setTwoFactorAuth = async params => {
  const { recipientId, enable } = params;
  const client = await createClient({ recipientId });
  const res = await client.setTwoFactorAuth(enable);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, setTwoFactorAuth, params);
};

const syncAccept = async params => {
  const { recipientId, randomId } = params;
  const client = await createClient({ recipientId });
  const version = LINK_DEVICES_FILE_VERSION;
  const res = await client.syncAccept({ version, randomId });
  return res.status === 200
    ? res
    : await checkExpiredSession(res, syncAccept, params);
};

const syncBegin = async recipientId => {
  const client = await createClient({ recipientId });
  const version = LINK_DEVICES_FILE_VERSION;
  const res = await client.syncBegin({ version });
  return res.status === 200
    ? res
    : await checkExpiredSession(res, syncBegin, recipientId);
};

const syncCancel = async recipientId => {
  const client = await createClient({ recipientId });
  const res = await client.syncCancel();
  return res.status === 200
    ? res
    : await checkExpiredSession(res, syncCancel, recipientId);
};

const syncDeny = async params => {
  const { recipientId, randomId } = params;
  const client = await createClient({ recipientId });
  const res = await client.syncDeny(randomId);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, syncDeny, params);
};

const syncStatus = async recipientId => {
  const client = await createClient({ recipientId });
  const res = await client.syncStatus();
  return res.status === 200
    ? res
    : await checkExpiredSession(res, syncStatus, recipientId);
};

const unlockDevice = async params => {
  const { recipientId } = params;
  const client = await createClient({ recipientId });
  const res = await client.unlockDevice(params);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, unlockDevice, params);
};

const updateDeviceType = async params => {
  const { recipientId, newDeviceType } = params;
  const client = await createClient({ recipientId });
  const res = await client.updateDeviceType(newDeviceType);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, updateDeviceType, params);
};

const updateName = async params => {
  const { name, recipientId } = params;
  const client = await createClient({ recipientId });
  const res = await client.updateName(name);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, updateName, params);
};

const updatePushToken = async params => {
  const { pushToken, recipientId } = params;
  const client = await createClient({ recipientId });
  if (client.pushToken !== pushToken) {
    const res = await client.updatePushToken(pushToken);
    if (res.status === 200) {
      client.pushToken = pushToken;
      return res;
    }
    return await checkExpiredSession(res, updatePushToken, params);
  }
};

const upgradeToRefreshToken = async client => {
  return await client.upgradeToRefreshToken();
};

const uploadAvatar = async params => {
  const QUALITY = 100;
  const RESIZE_DIM = 256;
  const JPEG_MIME = 'image/jpeg';
  const image = nativeImage.createFromPath(params.path);
  const size = image.getSize();
  const resizeDim =
    size.width > size.height ? { width: RESIZE_DIM } : { height: RESIZE_DIM };
  const resizedImage = image.resize(resizeDim);
  const imageBuffer = resizedImage.toJPEG(QUALITY);
  const readable = new Readable();
  readable.push(imageBuffer);
  readable.push(null);
  const clientParams = {
    contentType: JPEG_MIME,
    contentLength: imageBuffer.byteLength,
    readable: readable
  };
  const { recipientId } = params;
  const client = await createClient({ recipientId });
  return await client.uploadAvatar(clientParams);
};

const unsendEmail = async params => {
  const { recipientId, metadataKey } = params;
  const client = await createClient({ recipientId });
  const res = await client.unsendEmail(metadataKey);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, unsendEmail, params);
};

const validateRecoveryCode = async ({ newDeviceData, jwt }) => {
  const recipientId = getRecipientId(newDeviceData);
  const client = await createClient({ recipientId, optionalToken: jwt });
  const res = await client.validateCodeTwoFactorAuth(newDeviceData);
  return res;
};

module.exports = {
  activateAddress,
  acknowledgeEvents,
  canLogin,
  changePassword,
  changeRecoveryEmail,
  checkAvailableUsername,
  checkExpiredSession,
  deleteDeviceToken,
  deleteMyAccount,
  findDevices,
  findKeyBundles,
  generateEvent,
  getDataReady,
  getKeyBundle,
  getUserSettings,
  insertPreKeys,
  isCriptextDomain,
  linkAccept,
  linkAuth,
  linkBegin,
  linkCancel,
  linkDeny,
  linkStatus,
  login,
  loginFirst,
  logout,
  postDataReady,
  postEmail,
  postKeyBundle,
  postPeerEvent,
  pushPeerEvents,
  postUser,
  removeAvatar,
  removeDevice,
  reportPhishing,
  resendConfirmationEmail,
  resetPassword,
  setAddress,
  sendRecoveryCode,
  setReadTracking,
  setReplyTo,
  setTwoFactorAuth,
  syncAccept,
  syncBegin,
  syncCancel,
  syncDeny,
  syncStatus,
  unlockDevice,
  updateDeviceType,
  updateName,
  updatePushToken,
  uploadAvatar,
  unsendEmail,
  validateRecoveryCode
};
