const { client: WebSocketClient } = require('websocket');
const { DEV_SOCKET_URL, PROD_SOCKET_URL } = require('./utils/const');
const SOCKET_URL = PROD_SOCKET_URL;
var client, reconnect, messageListener, socketConnection;
var reconnectDelay = 1000;

const setMessageListener = mListener => (messageListener = mListener);

const disconnect = () => {
  console.log('[Socket] Se llama a Disconnect');
  if (socketConnection) {
    console.log('[Socket] Ya habia client. Se llamo a client.close()');
    socketConnection.close();
  }
};

const start = ({ jwt }) => {
  console.log('[Socket] Se llamo a Start');

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
    console.log('[Socket] Evento connect');

    reconnectDelay = 2000;
    socketConnection = connection;
    connection.on('error', error => {
      log('Connection Error: ' + error.toString());
      reconnect();
    });
    connection.on('close', () => {
      console.log('[Socket] Close de connection');
      // reconnect();
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
  if (process.env.DEBUG) {
    console.log(message);
  }
};

module.exports = {
  start,
  setMessageListener,
  disconnect
};
