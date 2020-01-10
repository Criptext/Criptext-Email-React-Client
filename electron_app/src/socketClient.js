const { client: WebSocketClient } = require('websocket');
const { SOCKET_URL } = require('./utils/const');
let client, reconnect, messageListener, socketConnection, lastJWT;
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
  client.connect(`${SOCKET_URL}?token=${jwt}`, 'criptext-protocol');
  lastJWT = jwt;
  client.on('connectFailed', error => {
    reconnect();
    log(error);
  });

  client.on('connect', connection => {
    socketConnection = connection;
    log('Socket connection opened');

    connection.on('error', error => {
      restartSocketSameJWT();
      log(error);
    });
    connection.on('close', () => {
      log('Socket connection closed');
    });
    connection.on('message', data => {
      const message = JSON.parse(data.utf8Data);
      messageListener(message);
    });
    connection.socket.setTimeout(30 * 1000);
    connection.socket.on('timeout', function() {
      log('Socket timeout');
      restartSocketSameJWT();
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
  lastJWT = jwt;
  shouldReconnect = false;
  disconnect();
  client = null;
  setTimeout(() => {
    shouldReconnect = true;
    start({ jwt });
  }, reconnectDelay * 2);
};

const restartSocketSameJWT = () => {
  if (!shouldReconnect) return;
  restartSocket({ jwt: lastJWT });
};

module.exports = {
  start,
  setMessageListener,
  disconnect,
  restartSocket,
  restartSocketSameJWT
};
