const { client: WebSocketClient } = require('websocket');
const { DEV_SOCKET_URL, PROD_SOCKET_URL } = require('./utils/const');
const SOCKET_URL =
  process.env.NODE_ENV === 'development' ? DEV_SOCKET_URL : PROD_SOCKET_URL;
var client, reconnect, messageListener;
var reconnectDelay = 1000;

const setMessageListener = mListener => (messageListener = mListener);

const disconnect = () => {
  if (client) {
    client.abort();
  }
};

const start = account => {
  disconnect();
  client = new WebSocketClient();

  client.on('connectFailed', error => {
    log('Connect Error: ' + error.toString());
    reconnect();
  });

  client.on('connect', connection => {
    reconnectDelay = 2000;
    connection.on('error', error => {
      log('Connection Error: ' + error.toString());
      reconnect();
    });
    connection.on('close', () => {
      reconnect();
    });
    connection.on('message', data => {
      const message = JSON.parse(data.utf8Data);
      messageListener(message);
    });
  });

  client.connect(
    `${SOCKET_URL}?token=${account.jwt}`,
    'criptext-protocol'
  );

  reconnect = () => {
    setTimeout(() => {
      log(`Websocket reconnecting...`);
      start(account);
    }, reconnectDelay);
  };
};

const log = message => {
  if (process.env.DEBUG) {
    console.log(message);
  }
};

module.exports = {
  start,
  setMessageListener,
  disconnect
};
