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

const postUser = async params => {
  await checkClient();
  return client.postUser(params);
};

module.exports = {
  initClient,
  getEmailBody,
  getEvents,
  login,
  postUser
};
