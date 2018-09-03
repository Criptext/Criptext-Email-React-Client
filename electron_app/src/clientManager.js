const ClientAPI = require('@criptext/email-http-client');
const { PROD_SERVER_URL } = require('./utils/const');
const { getAccount } = require('./DBManager');
const mailboxWindow = require('./windows/mailbox');
let client = {};

const checkClient = async () => {
  const [account] = await getAccount();
  const token = account ? account.jwt : undefined;
  if (!client.login || client.token !== token) {
    const clientOptions = {
      url: process.env.REACT_APP_KEYSERVER_URL || PROD_SERVER_URL,
      token,
      timeout: 60000
    };
    client = new ClientAPI(clientOptions);
    client.token = token;
  }
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
    this.check();
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

  async check() {
    await checkClient();
  }

  checkAvailableUsername(username) {
    return client.checkAvailableUsername(username);
  }

  async findKeyBundles(params) {
    const res = await client.findKeyBundles(params);
    return checkDeviceRemoved(res);
  }

  async getEmailBody(bodyKey) {
    const res = await client.getEmailBody(bodyKey);
    return checkDeviceRemoved(res);
  }

  async getEvents() {
    await this.check();
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

  async getDevices() {
    const res = await client.getDevices();
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
    const { devices, recoveryEmail } = settings;
    const { address, status } = recoveryEmail;
    return {
      devices,
      recoveryEmail: address,
      recoveryEmailConfirmed: !!status
    };
  }

  login(data) {
    return client.login(data);
  }

  async logout() {
    const res = await client.logout();
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
    const res = await client.postOpenEvent(metadataKeys);
    return checkDeviceRemoved(res);
  }

  async postPeerEvent(params) {
    const res = await client.postPeerEvent(params);
    return checkDeviceRemoved(res);
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

  async unlockDevice(params) {
    const res = await client.unlockDevice(params);
    return checkDeviceRemoved(res);
  }

  async updateName(data) {
    const { name } = data.params;
    const updateNameResponse = await client.updateName(name);
    checkDeviceRemoved(updateNameResponse);
    const peerResponse = await client.postPeerEvent(data);
    return checkDeviceRemoved(peerResponse);
  }

  async unsendEmail(params) {
    const res = await client.unsendEmail(params);
    return checkDeviceRemoved(res);
  }
}

module.exports = new ClientManager();
