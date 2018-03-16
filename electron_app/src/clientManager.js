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

const login = async data => {
  await checkClient();
  return client.login(data);
};

const findKeyBundles = async params => {
  await checkClient();
  return client.findKeyBundles(params);
};

const getEvents = async () => {
  await checkClient();
  const res = await client.getPendingEvents();
  return formEvents(res.body);
};

const formEvents = events => {
  return events.map(event => {
    const { params, cmd } = event;
    return { cmd, params: JSON.parse(params) };
  });
};

const getEmailBody = async bodyKey => {
  await checkClient();
  return client.getEmailBody(bodyKey);
};

const postEmail = async params => {
  await checkClient();
  return client.postEmail(params);
};

const postUser = async params => {
  await checkClient();
  return client.postUser(params);
};

module.exports = {
  findKeyBundles,
  getEmailBody,
  getEvents,
  login,
  postEmail,
  postUser
};
