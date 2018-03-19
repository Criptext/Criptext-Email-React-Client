const ClientAPI = require('@criptext/email-http-client');
const { db, Table } = require('./models.js');
let client = {};

const initClient = async () => {
  const account = await db.table(Table.ACCOUNT).select('*');
  const token = !account.length ? undefined : account[0].jwt;
  client = new ClientAPI(process.env.REACT_APP_KEYSERVER_URL, token);
};

const checkClient = async () => {
  if (!client.login) {
    await initClient();
    return;
  }
};

const login = data => {
  return client.login(data);
};

const findKeyBundles = params => {
  return client.findKeyBundles(params);
};

const getEvents = async () => {
  const res = await client.getPendingEvents();
  return formEvents(res.body);
};

const formEvents = events => {
  return events.map(event => {
    const { params, cmd } = event;
    return { cmd, params: JSON.parse(params) };
  });
};

const getEmailBody = bodyKey => {
  return client.getEmailBody(bodyKey);
};

const postEmail = params => {
  return client.postEmail(params);
};

const postUser = params => {
  return client.postUser(params);
};

module.exports = {
  checkClient,
  findKeyBundles,
  getEmailBody,
  getEvents,
  login,
  postEmail,
  postUser
};
