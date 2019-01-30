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
  updateAccount
} = require('./DBManager');
const { processEventsQueue } = require('./eventQueueManager');
const globalManager = require('./globalManager');
const mailboxWindow = require('./windows/mailbox');
const socketClient = require('./socketClient');
const packageInfo = require('./../package.json');
const appVersion = packageInfo.version;
const { getOsAndArch } = require('./utils/osUtils');
let client = {};

const initializeClient = ({ token, refreshToken, language, os }) => {
  const clientOptions = {
    url: SERVER_URL,
    token,
    refreshToken,
    timeout: 60 * 1000,
    version: API_CLIENT_VERSION,
    language,
    appVersion,
    os
  };
  client = new ClientAPI(clientOptions);
  client.token = token;
  client.refreshToken = refreshToken;
  client.language = language;
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

const checkExpiredSession = async (
  requirementResponse,
  initialRequest,
  requestparams
) => {
  const NEW_SESSION_SUCCESS_STATUS = 200;
  const EXPIRED_SESSION_STATUS = 401;
  const CHANGED_PASSWORD_STATUS = 403;

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
        newSessionToken = newSessionResponse.text;
      }

      if (newSessionStatus === EXPIRED_SESSION_STATUS) {
        return mailboxWindow.send('device-removed', null);
      } else if (newSessionStatus === NEW_SESSION_SUCCESS_STATUS) {
        await updateAccount({
          jwt: newSessionToken,
          refreshToken: newRefreshToken,
          recipientId
        });
        socketClient.restartSocket({ jwt: newSessionToken });
        return await initialRequest(requestparams);
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

const findKeyBundles = async params => {
  const res = await client.findKeyBundles(params);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, findKeyBundles, params);
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
  await checkClient({});
  const res = await client.getPendingEvents();
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

const postEmail = async params => {
  const res = await client.postEmail(params);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, postEmail, params);
};

const postKeyBundle = async params => {
  const res = await client.postKeyBundle(params);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, postKeyBundle, params);
};

const postOpenEvent = async metadataKeys => {
  const OPEN_EVENT_CMD = 500;
  try {
    const data = {
      cmd: OPEN_EVENT_CMD,
      params: {
        metadataKeys: [...metadataKeys]
      }
    };
    await createPendingEvent({
      data: JSON.stringify(data)
    });
    processEventsQueue();
    return Promise.resolve({ status: 200 });
  } catch (e) {
    return Promise.reject({ status: 422 });
  }
};

const postPeerEvent = async params => {
  try {
    await createPendingEvent({
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

const updateName = async ({ name }) => {
  const res = await client.updateName(name);
  return res.status === 200
    ? res
    : await checkExpiredSession(res, updateName, { name });
};

const upgradeToRefreshToken = async () => {
  return await client.upgradeToRefreshToken();
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
  postOpenEvent,
  postPeerEvent,
  pushPeerEvents,
  postUser,
  removeDevice,
  resendConfirmationEmail,
  resetPassword,
  setReadTracking,
  setReplyTo,
  setTwoFactorAuth,
  syncAccept,
  syncBegin,
  syncDeny,
  syncStatus,
  unlockDevice,
  updateName,
  unsendEmail
};
