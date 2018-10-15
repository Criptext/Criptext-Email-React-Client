const { client: WebSocketClient } = require('websocket');
const { DEV_SOCKET_URL, PROD_SOCKET_URL } = require('./utils/const');
const SOCKET_URL =
  process.env.NODE_ENV === 'development' ? DEV_SOCKET_URL : PROD_SOCKET_URL;
var client, reconnect, messageListener, socketConnection;
var reconnectDelay = 1000;

const setMessageListener = mListener => (messageListener = mListener);

const disconnect = () => {
  if (socketConnection) {
    socketConnection.close();
  }
};

const start = ({ jwt }) => {
  client = new WebSocketClient();
  client.connect(
    `${SOCKET_URL}?token=${jwt}`,
    'criptext-protocol'
  );

  client.on('connectFailed', error => {
    log('Connect Error: ' + error.toString());
    reconnect();
  });

  client.on('connect', connection => {
    reconnectDelay = 2000;
    socketConnection = connection;
    log('Socket connection opened');

    connection.on('error', error => {
      log('Connection Error: ' + error.toString());
      reconnect();
    });
    connection.on('close', () => {
      log('Socket connection closed');
    });
    connection.on('message', data => {
      const message = JSON.parse(data.utf8Data);
      messageListener(message);
    });
  });

  reconnect = () => {
    setTimeout(() => {
      log('Websocket reconnecting...');
      start({ jwt });
    }, reconnectDelay);
  };
};

const log = message => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message);
  }
};

module.exports = {
  start,
  setMessageListener,
  disconnect
};
