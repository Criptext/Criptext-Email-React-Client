const { client: WebSocketClient } = require('websocket');
const { PROD_SOCKET_URL } = require('./utils/consts');
const SOCKET_URL = process.env.REACT_APP_SOCKETSERVER_URL || PROD_SOCKET_URL;
var client, reconnect, messageListener;
var reconnectDelay = 1000;

const setMessageListener = mListener => (messageListener = mListener);

const start = account => {
  if (client) {
    client.abort();
  }
  client = new WebSocketClient();

  client.on('connectFailed', function(error) {
    log('Connect Error: ' + error.toString());
    reconnect();
  });

  client.on('connect', function(connection) {
    reconnectDelay = 2000;
    connection.on('error', function(error) {
      log('Connection Error: ' + error.toString());
      reconnect();
    });
    connection.on('close', function() {
      reconnect();
    });
    connection.on('message', function(data) {
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
  setMessageListener
};
