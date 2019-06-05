const ClientAPI = require('@criptext/api');
const {
  SERVER_URL,
  API_CLIENT_VERSION,
  LINK_DEVICES_FILE_VERSION
} = require('./utils/const');
const {
  createPendingEvent,
  getAccount,
  getSettings,
  updateAccount,
  getAccountByParams
} = require('./DBManager');
const { processEventsQueue } = require('./eventQueueManager');
const globalManager = require('./globalManager');
const mailboxWindow = require('./windows/mailbox');
const socketClient = require('./socketClient');
const packageInfo = require('./../package.json');
const appVersion = packageInfo.version;
const { getOsAndArch } = require('./utils/osUtils');
const { Readable } = require('stream');
const nativeImage = require('electron').nativeImage;
let client = {};

const initializeClient = ({ token, refreshToken, language, os }) => {
  const clientOptions = {
    os,
    token,
    language,
    appVersion,
    refreshToken,
    url: SERVER_URL,
    timeout: 60 * 1000,
    version: API_CLIENT_VERSION,
    errorCallback: handleClientError
  };
  client = new ClientAPI(clientOptions);
  client.token = token;
  client.refreshToken = refreshToken;
  client.language = language;
};

const handleClientError = err => {
  const NO_INTERNET_CONNECTION_CODE = 'ENOTFOUND';
  if (err.code === NO_INTERNET_CONNECTION_CODE) {
    mailboxWindow.send('lost-network-connection', null);
  } else {
    throw err;
  }
};

const checkClient = async ({ optionalSessionToken, optionalRefreshToken }) => {
  const { language } = await getSettings();
  const osAndArch = await getOsAndArch();
  const osInfo = Object.values(osAndArch)
    .filter(val => !!val)
    .join(' ');
  if (optionalSessionToken || optionalRefreshToken) {
    return initializeClient({
      token: optionalSessionToken,
      refreshToken: optionalRefreshToken,
      language,
      os: osInfo
    });
  }
  const [account] = await getAccount();
  const [token, refreshToken] = account
    ? [account.jwt, account.refreshToken]
    : [undefined, undefined];

  if (
    !client.login ||
    client.token !== token ||
    client.refreshToken !== refreshToken ||
    client.language !== language
  ) {
    return initializeClient({ token, refreshToken, language, os: osInfo });
  }
};

const restartClient = async ({ accountId }) => {
  const [account] = await getAccountByParams({ id: accountId });
  const [token, refreshToken] = account
    ? [account.jwt, account.refreshToken]
    : [undefined, undefined];
  await checkClient({
    optionalSessionToken: token,
    optionalRefreshToken: refreshToken
  });
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
  const INITIAL_REQUEST_EMPTY_STATUS = 499;

  const status = requirementResponse.status;
  switch (status) {
    case CHANGED_PASSWORD_STATUS: {
      return mailboxWindow.send('password-changed', null);
    }
    case EXPIRED_SESSION_STATUS: {
      let newSessionToken, newRefreshToken, newSessionStatus;
      const [{ recipientId, refreshToken }] = await getAccount();
      if (!refreshToken) {
        const getRefreshTokenResponse = await upgradeToRefreshToken();
        newSessionStatus = getRefreshTokenResponse.status;
        newSessionToken = getRefreshTokenResponse.body.token;
        newRefreshToken = getRefreshTokenResponse.body.refreshToken;
      } else {
        const newSessionResponse = await client.refreshSession();
        newSessionStatus = newSessionResponse.status;
        if (newSessionStatus === NEW_SESSION_SUCCESS_STATUS) {
          newSessionToken = newSessionResponse.text;
        } else if (newSessionStatus === UPDATE_USER_TOKENS) {
          newSessionToken = newSessionResponse.body.token;
          newRefreshToken = newSessionResponse.body.refreshToken;
        }
      }
      if (newSessionStatus === EXPIRED_SESSION_STATUS) {
        return mailboxWindow.send('device-removed', null);
      }

      if (
        newSessionStatus === NEW_SESSION_SUCCESS_STATUS ||
        newSessionStatus === UPDATE_USER_TOKENS
      ) {
        await updateAccount({
          jwt: newSessionToken,
          refreshToken: newRefreshToken,
          recipientId
        });
        if (client.token) client.token = newSessionToken;
        socketClient.restartSocket({ jwt: newSessionToken });
        if (initialRequest) {
          return await initialRequest(requestparams);
        }
        return { status: INITIAL_REQUEST_EMPTY_STATUS, newSessionToken };
      }
      break;
    }
    default: {
      return requirementResponse;
    }
  }
};

// Auto-init client
checkClient({});

const acknowledgeEvents = async eventIds => {
  const res = await client.acknowledgeEvents(eventIds);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, acknowledgeEvents, eventIds);
};

const changeRecoveryEmail = async params => {
  const res = await client.changeRecoveryEmail(params);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, changeRecoveryEmail, params);
};

const setReplyTo = async params => {
  const res = await client.setReplyTo(params);
  return res.status === 200
    ? { status: res.status }
    : await checkExpiredSession(res, setReplyTo, params);
};

const changePassword = async params => {
  const res = await client.changePassword(params);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, changePassword, params);
};

const checkAvailableUsername = async username => {
  return await client.checkAvailableUsername(username);
};

const deleteMyAccount = async password => {
  const res = await client.deleteMyAccount(password);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, deleteMyAccount, password);
};

const findKeyBundles = async ({ params, accountId }) => {
  if (accountId) await restartClient({ accountId });
  const res = await client.findKeyBundles(params);
  const result =
    res.status === 200
      ? res
      : await checkExpiredSession(res, findKeyBundles, { params, accountId });
  if (accountId) {
    const [account] = await getAccount();
    await restartClient({ accountId: account.id });
  }
  return result;
};

const getDataReady = async () => {
  const res = await client.getDataReady();
  return res.status === 200
    ? res
    : await checkExpiredSession(res, getDataReady, null);
};

const getEmailBody = async bodyKey => {
  const res = await client.getEmailBody(bodyKey);
  return res.status === 200
    ? { status: res.status, body: res.body }
    : checkExpiredSession(res, getEmailBody, bodyKey);
};

const getEvents = async () => {
  const PENDING_EVENTS_STATUS_OK = 200;
  const PENDING_EVENTS_STATUS_MORE = 201;
  const NO_EVENTS_STATUS = 204;
  const [account] = await getAccount();
  await checkClient({});
  const res = await client.getPendingEvents(account.id);
  switch (res.status) {
    case PENDING_EVENTS_STATUS_OK:
      return { events: formEvents(res.body) };
    case PENDING_EVENTS_STATUS_MORE:
      return { events: formEvents(res.body), hasMoreEvents: true };
    case NO_EVENTS_STATUS:
      return { events: [] };
    default:
      return await checkExpiredSession(res, getEvents, null);
  }
};

const formEvents = events =>
  events.map(event => ({
    cmd: event.cmd,
    params: JSON.parse(event.params),
    rowid: event.rowid
  }));

const getKeyBundle = async deviceId => {
  const res = await client.getKeyBundle(deviceId);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, getKeyBundle, deviceId);
};

const getUserSettings = async () => {
  const res = await client.getUserSettings();
  return res.status === 200
    ? parseUserSettings(res.body)
    : await checkExpiredSession(res, getUserSettings, null);
};

const parseUserSettings = settings => {
  const { devices, general } = settings;
  const {
    recoveryEmail,
    recoveryEmailConfirmed,
    replyTo,
    twoFactorAuth,
    trackEmailRead
  } = general;
  return {
    devices,
    twoFactorAuth: !!twoFactorAuth,
    recoveryEmail,
    recoveryEmailConfirmed: !!recoveryEmailConfirmed,
    readReceiptsEnabled: !!trackEmailRead,
    replyTo: replyTo
  };
};

const insertPreKeys = async preKeys => {
  const res = await client.insertPreKeys(preKeys);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, insertPreKeys, preKeys);
};

const linkAccept = async randomId => {
  const data = { randomId, version: LINK_DEVICES_FILE_VERSION };
  const res = await client.linkAccept(data);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, linkAccept, data);
};

const linkAuth = async ({ newDeviceData, jwt }) => {
  await checkClient({ optionalSessionToken: jwt });
  return await client.linkAuth(newDeviceData);
};

const linkBegin = async username => {
  const data = { targetUsername: username, version: LINK_DEVICES_FILE_VERSION };
  return await client.linkBegin(data);
};

const linkDeny = async randomId => {
  const res = await client.linkDeny(randomId);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, linkDeny, randomId);
};

const linkStatus = async () => {
  const res = await client.linkStatus();
  return res.status === 200
    ? res
    : await checkExpiredSession(res, linkStatus, null);
};

const login = async data => {
  return await client.login(data);
};

const logout = async () => {
  const res = await client.logout();
  return res.status === 200
    ? res
    : await checkExpiredSession(res, logout, null);
};

const postDataReady = async params => {
  const res = await client.postDataReady(params);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, postDataReady, params);
};

const postEmail = async ({ params, accountId }) => {
  if (accountId) await restartClient({ accountId });
  const res = await client.postEmail(params);
  const result =
    res.status === 200
      ? res
      : await checkExpiredSession(res, postEmail, { params, accountId });
  if (accountId) {
    const [account] = await getAccount();
    await restartClient({ accountId: account.id });
  }
  return result;
};

const postKeyBundle = async params => {
  const res = await client.postKeyBundle(params);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, postKeyBundle, params);
};

const postPeerEvent = async params => {
  const { accountId } = params;
  const event = Object.assign({}, params);
  delete event.accountId;
  try {
    await createPendingEvent({
      accountId,
      data: JSON.stringify(params)
    });
    processEventsQueue();
    return Promise.resolve({ status: 200 });
  } catch (e) {
    return Promise.reject({ status: 422 });
  }
};

const pushPeerEvents = async events => {
  try {
    const res = await client.postPeerEvent({
      peerEvents: [...events]
    });
    return res.status === 200
      ? res
      : await checkExpiredSession(res, pushPeerEvents, events);
  } catch (e) {
    if (e.code === 'ENOTFOUND') {
      globalManager.internetConnection.setStatus(false);
      return Promise.resolve({ status: 200 });
    }
    return Promise.reject({ status: 422 });
  }
};

const postUser = async params => {
  return await client.postUser(params);
};

const removeAvatar = async () => {
  return await client.deleteAvatar();
};

const removeDevice = async params => {
  const res = await client.removeDevice(params);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, removeDevice, params);
};

const resendConfirmationEmail = async () => {
  const res = await client.resendConfirmationEmail();
  return res.status === 200
    ? res
    : await checkExpiredSession(res, resendConfirmationEmail, null);
};

const resetPassword = async recipientId => {
  const res = await client.resetPassword(recipientId);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, resetPassword, recipientId);
};

const setReadTracking = async enabled => {
  const res = await client.setReadTracking(enabled);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, setReadTracking, enabled);
};

const setTwoFactorAuth = async enable => {
  const res = await client.setTwoFactorAuth(enable);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, setTwoFactorAuth, enable);
};

const syncAccept = async randomId => {
  const version = LINK_DEVICES_FILE_VERSION;
  const res = await client.syncAccept({ version, randomId });
  return res.status === 200
    ? res
    : await checkExpiredSession(res, syncAccept, randomId);
};

const syncBegin = async () => {
  const version = LINK_DEVICES_FILE_VERSION;
  const res = await client.syncBegin({ version });
  return res.status === 200
    ? res
    : await checkExpiredSession(res, syncBegin, null);
};

const syncDeny = async randomId => {
  const res = await client.syncDeny(randomId);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, syncDeny, randomId);
};

const syncStatus = async () => {
  const res = await client.syncStatus();
  return res.status === 200
    ? res
    : await checkExpiredSession(res, syncStatus, null);
};

const unlockDevice = async params => {
  const res = await client.unlockDevice(params);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, unlockDevice, params);
};

const updateDeviceType = async newDeviceType => {
  const res = await client.updateDeviceType(newDeviceType);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, updateDeviceType, newDeviceType);
};

const updateName = async ({ name }) => {
  const res = await client.updateName(name);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, updateName, { name });
};

const updatePushToken = async pushToken => {
  const res = await client.updatePushToken(pushToken);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, updatePushToken, pushToken);
};

const upgradeToRefreshToken = async () => {
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
  return await client.uploadAvatar(clientParams);
};

const unsendEmail = async params => {
  const res = await client.unsendEmail(params);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, unsendEmail, params);
};

module.exports = {
  acknowledgeEvents,
  changePassword,
  changeRecoveryEmail,
  checkAvailableUsername,
  checkExpiredSession,
  deleteMyAccount,
  findKeyBundles,
  getDataReady,
  getEmailBody,
  getEvents,
  getKeyBundle,
  getUserSettings,
  insertPreKeys,
  linkAccept,
  linkAuth,
  linkBegin,
  linkDeny,
  linkStatus,
  login,
  logout,
  postDataReady,
  postEmail,
  postKeyBundle,
  postPeerEvent,
  pushPeerEvents,
  postUser,
  removeAvatar,
  removeDevice,
  resendConfirmationEmail,
  resetPassword,
  restartClient,
  setReadTracking,
  setReplyTo,
  setTwoFactorAuth,
  syncAccept,
  syncBegin,
  syncDeny,
  syncStatus,
  unlockDevice,
  updateDeviceType,
  updateName,
  updatePushToken,
  uploadAvatar,
  unsendEmail
};
