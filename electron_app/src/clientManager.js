const ClientAPI = require('@criptext/email-http-client');
const { db, Table } = require('./models.js');
let client = {}

const initClient = async () => {
  const account = await db.table(Table.ACCOUNT).select('*');
  const token = account[0].jwt;
  client = new ClientAPI(process.env.REACT_APP_KEYSERVER_URL, token);
}

const getEvents = async () => {
  if (!client.getPendingEvents ) {
    await initClient();
  }
  const res = await client.getPendingEvents();
  return formEvents(res.body);
};

const formEvents = events => {
  return events.map(event => {
    const { params, cmd } = event;
    return { cmd, params: JSON.parse(params) };
  });
};

const login = async (data) => {
  if (!client.login) {
    await initClient();
  }
  return client.login(data);
};

module.exports = {
  initClient,
  getEvents,
  login
}