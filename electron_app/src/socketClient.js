const { client: WebSocketClient } = require('websocket');
const { DEV_SOCKET_URL, PROD_SOCKET_URL } = require('./utils/const');
const SOCKET_URL =
  process.env.NODE_ENV === 'development' ? DEV_SOCKET_URL : PROD_SOCKET_URL;
var client, reconnect, messageListener, socketConnection;
var reconnectDelay = 2000;
const globalManager = require('./globalManager');
const NETWORK_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline'
};

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
    handleError(error, 'Failed to connect');
    reconnect();
  });

  client.on('connect', connection => {
    socketConnection = connection;
    setConnectionStatus(NETWORK_STATUS.ONLINE);
    log('Socket connection opened');

    connection.on('error', error => {
      handleError(error, 'Connection Error');
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

const handleError = (error, errorMessage) => {
  if (error.code === 'ENOTFOUND') {
    setConnectionStatus(NETWORK_STATUS.OFFLINE);
  }
  log(`${errorMessage || 'Error'}: ${error.toString()}`);
};

const setConnectionStatus = networkStatus => {
  switch (networkStatus) {
    case NETWORK_STATUS.ONLINE: {
      globalManager.internetConnection.setStatus(true);
      break;
    }
    case NETWORK_STATUS.OFFLINE: {
      globalManager.internetConnection.setStatus(false);
      break;
    }
    default:
      break;
  }
};

module.exports = {
  start,
  setMessageListener,
  disconnect
};
