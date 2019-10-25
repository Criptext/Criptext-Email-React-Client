const { client: WebSocketClient } = require('websocket');
const { SOCKET_URL } = require('./utils/const');
let client, reconnect, messageListener, socketConnection;
let shouldReconnect = true;
const reconnectDelay = 2000;

const setMessageListener = mListener => (messageListener = mListener);

const disconnect = () => {
  if (!socketConnection) return;
  try {
    socketConnection.on('close', () => {
      socketConnection = undefined;
    });
    socketConnection.close();
  } catch (err) {
    return;
  }
};

const start = ({ jwt }) => {
  client = new WebSocketClient();
  client.connect(
    `${SOCKET_URL}?token=${jwt}`,
    'criptext-protocol'
  );

  client.on('connectFailed', error => {
    if (shouldReconnect) {
      reconnect();
    }
    log(error);
  });

  client.on('connect', connection => {
    socketConnection = connection;
    log('Socket connection opened');

    connection.on('error', error => {
      reconnect();
      log(error);
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
    if (shouldReconnect) {
      setTimeout(() => {
        log('Websocket reconnecting...');
        start({ jwt });
      }, reconnectDelay);
    }
  };
};

const log = message => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[WebSocket]: ${message}`);
  }
};

process.on('exit', () => {
  disconnect();
});

const restartSocket = ({ jwt }) => {
  shouldReconnect = false;
  disconnect();
  client = null;
  setTimeout(() => {
    shouldReconnect = true;
    start({ jwt });
  }, reconnectDelay * 2);
};

module.exports = {
  start,
  setMessageListener,
  disconnect,
  restartSocket
};
