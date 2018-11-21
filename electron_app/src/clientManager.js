const ClientAPI = require('@criptext/api');
const { DEV_SERVER_URL, PROD_SERVER_URL } = require('./utils/const');
const { getAccount, createPendingEvent } = require('./DBManager');
const { processEventsQueue } = require('./eventQueueManager');
const globalManager = require('./globalManager');
const mailboxWindow = require('./windows/mailbox');
let client = {};

const checkClient = async ({ optionalNewToken }) => {
  if (optionalNewToken) {
    return initializeClient({ token: optionalNewToken });
  }
  const [account] = await getAccount();
  const token = account ? account.jwt : undefined;
  if (!client.login || client.token !== token) {
    initializeClient({ token });
  }
};

const initializeClient = ({ token }) => {
  const clientOptions = {
    url:
      process.env.NODE_ENV === 'development' ? DEV_SERVER_URL : PROD_SERVER_URL,
    token,
    timeout: 60000,
    version: '3.0.0'
  };
  client = new ClientAPI(clientOptions);
  client.token = token;
};

const checkDeviceRemoved = res => {
  const REMOVED_DEVICE_STATUS = 401;
  const CHANGED_PASSWORD_STATUS = 403;
  const { status } = res;
  switch (status) {
    case REMOVED_DEVICE_STATUS: {
      return mailboxWindow.send('device-removed', null);
    }
    case CHANGED_PASSWORD_STATUS: {
      return mailboxWindow.send('password-changed', null);
    }
    default:
      return res;
  }
};

class ClientManager {
  constructor() {
    this.check({});
  }

  async acknowledgeEvents(eventIds) {
    const res = await client.acknowledgeEvents(eventIds);
    return checkDeviceRemoved(res);
  }

  async changeRecoveryEmail(params) {
    const res = await client.changeRecoveryEmail(params);
    return checkDeviceRemoved(res);
  }

  async changePassword(params) {
    const res = await client.changePassword(params);
    return checkDeviceRemoved(res);
  }

  async check({ token }) {
    await checkClient({ optionalNewToken: token });
  }

  checkAvailableUsername(username) {
    return client.checkAvailableUsername(username);
  }

  async findKeyBundles(params) {
    const res = await client.findKeyBundles(params);
    return checkDeviceRemoved(res);
  }

  async getDataReady() {
    const res = await client.getDataReady();
    return checkDeviceRemoved(res);
  }

  async getEmailBody(bodyKey) {
    const res = await client.getEmailBody(bodyKey);
    return checkDeviceRemoved(res);
  }

  async getEvents() {
    await this.check({});
    const res = await client.getPendingEvents();
    const { status, body } = checkDeviceRemoved(res);
    return status === 204 ? [] : this.formEvents(body);
  }

  formEvents(events) {
    return events.map(event => {
      const { params, cmd, rowid } = event;
      return { cmd, params: JSON.parse(params), rowid };
    });
  }

  async getKeyBundle(deviceId) {
    const res = await client.getKeyBundle(deviceId);
    return checkDeviceRemoved(res);
  }

  async getUserSettings() {
    const res = await client.getUserSettings();
    const checkedResponse = checkDeviceRemoved(res);
    if (checkedResponse.status) {
      return this.parseUserSettings(checkedResponse.body);
    }
  }

  parseUserSettings(settings) {
    const { devices, general } = settings;
    const {
      recoveryEmail,
      recoveryEmailConfirmed,
      twoFactorAuth,
      trackEmailRead
    } = general;
    return {
      devices,
      twoFactorAuth: !!twoFactorAuth,
      recoveryEmail,
      recoveryEmailConfirmed: !!recoveryEmailConfirmed,
      readReceiptsEnabled: !!trackEmailRead
    };
  }

  async linkAccept(randomId) {
    const res = await client.linkAccept(randomId);
    return checkDeviceRemoved(res);
  }

  async linkAuth({ newDeviceData, jwt }) {
    await this.check({ token: jwt });
    return client.linkAuth(newDeviceData);
  }

  async linkBegin(username) {
    const { status, text } = await client.linkBegin(username);
    return { status, text };
  }

  async linkDeny(randomId) {
    const res = await client.linkDeny(randomId);
    return checkDeviceRemoved(res);
  }

  async linkStatus() {
    const res = await client.linkStatus();
    return checkDeviceRemoved(res);
  }

  login(data) {
    return client.login(data);
  }

  async logout() {
    const res = await client.logout();
    return checkDeviceRemoved(res);
  }

  async postDataReady(params) {
    const res = await client.postDataReady(params);
    return checkDeviceRemoved(res);
  }

  async postEmail(params) {
    const res = await client.postEmail(params);
    return checkDeviceRemoved(res);
  }

  async postKeyBundle(params) {
    const res = await client.postKeyBundle(params);
    return checkDeviceRemoved(res);
  }

  async postOpenEvent(metadataKeys) {
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
  }

  async postPeerEvent(params) {
    try {
      await createPendingEvent({
        data: JSON.stringify(params)
      });
      processEventsQueue();
      return Promise.resolve({ status: 200 });
    } catch (e) {
      return Promise.reject({ status: 422 });
    }
  }

  async pushPeerEvents(events) {
    try {
      const res = await client.postPeerEvent({
        peerEvents: [...events]
      });
      return checkDeviceRemoved(res);
    } catch (e) {
      if (e.code === 'ENOTFOUND') {
        globalManager.internetConnection.setStatus(false);
        return Promise.resolve({ status: 200 });
      }
      return Promise.reject({ status: 422 });
    }
  }

  postUser(params) {
    return client.postUser(params);
  }

  async removeDevice(params) {
    const res = await client.removeDevice(params);
    return checkDeviceRemoved(res);
  }

  async resendConfirmationEmail() {
    const res = await client.resendConfirmationEmail();
    return checkDeviceRemoved(res);
  }

  async resetPassword(recipientId) {
    const res = await client.resetPassword(recipientId);
    return checkDeviceRemoved(res);
  }
  async setReadTracking(enabled) {
    const res = await client.setReadTracking(enabled);
    return checkDeviceRemoved(res);
  }

  async setTwoFactorAuth(enable) {
    const res = await client.setTwoFactorAuth(enable);
    return checkDeviceRemoved(res);
  }

  async unlockDevice(params) {
    const res = await client.unlockDevice(params);
    return checkDeviceRemoved(res);
  }

  async updateName({ name }) {
    const res = await client.updateName(name);
    return checkDeviceRemoved(res);
  }

  async unsendEmail(params) {
    const res = await client.unsendEmail(params);
    return checkDeviceRemoved(res);
  }
}

module.exports = new ClientManager();
