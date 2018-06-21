const ClientAPI = require('@criptext/email-http-client');
const { PROD_SERVER_URL } = require('./utils/consts');
const { db, Table } = require('./models.js');
let client = {};

const checkClient = async () => {
  if (!client.login) {
    const account = await db.table(Table.ACCOUNT).select('*');
    const token = !account.length ? undefined : account[0].jwt;
    const clientOptions = {
      url: process.env.REACT_APP_KEYSERVER_URL || PROD_SERVER_URL,
      token
    };
    client = new ClientAPI(clientOptions);
  }
};

class ClientManager {
  constructor() {
    this.check();
  }

  acknowledgeEvents(eventIds) {
    return client.acknowledgeEvents(eventIds);
  }

  async check() {
    await checkClient();
  }

  checkAvailableUsername(username) {
    return client.checkAvailableUsername(username);
  }

  findKeyBundles(params) {
    return client.findKeyBundles(params);
  }

  getEmailBody(bodyKey) {
    return client.getEmailBody(bodyKey);
  }

  async getEvents() {
    const res = await client.getPendingEvents();
    return this.formEvents(res.body);
  }

  formEvents(events) {
    return events.map(event => {
      const { params, cmd, rowid } = event;
      return { cmd, params: JSON.parse(params), rowid };
    });
  }

  login(data) {
    return client.login(data);
  }

  postEmail(params) {
    return client.postEmail(params);
  }

  postKeyBundle(params) {
    return client.postKeyBundle(params);
  }

  postOpenEvent(params) {
    return client.postOpenEvent(params);
  }

  postUser(params) {
    return client.postUser(params);
  }
}

module.exports = new ClientManager();
