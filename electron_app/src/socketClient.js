const { client: WebSocketClient } = require('websocket');
const { SOCKET_URL } = require('./utils/const');
let client, reconnect, messageListener, socketConnection;
const NETWORK_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline'
};
let shouldReconnect = true;
const reconnectDelay = 2000;

const globalManager = require('./globalManager');
const mailboxWindow = require('./windows/mailbox');

//  Ping
const spawn = require('child_process').spawn;
let pingProcess;

const setMessageListener = mListener => (messageListener = mListener);

const disconnect = () => {
  if (!socketConnection || !pingProcess) return;
  try {
    pingProcess.on('close', () => {
      pingProcess = undefined;
    });
    socketConnection.on('close', () => {
      socketConnection = undefined;
    });
    pingProcess.kill('SIGKILL');
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
    handleError(error, 'Failed to connect');
    if (shouldReconnect) {
      reconnect();
    }
  });

  client.on('connect', connection => {
    socketConnection = connection;
    setConnectionStatus(NETWORK_STATUS.ONLINE);
    log('Socket connection opened');
    checkAlive();

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

const handleError = (error, errorMessage) => {
  if (error.code === 'ENOTFOUND') {
    setConnectionStatus(NETWORK_STATUS.OFFLINE);
  }
  log(`${errorMessage || 'Error'}: ${error.toString()}`);
};

const setConnectionStatus = networkStatus => {
  const prevNetworkStatus = globalManager.internetConnection.getStatus();
  switch (networkStatus) {
    case NETWORK_STATUS.ONLINE: {
      if (prevNetworkStatus === true) return;
      if (prevNetworkStatus === false) {
        mailboxWindow.send('network-connection-established');
      }
      globalManager.internetConnection.setStatus(true);
      break;
    }
    case NETWORK_STATUS.OFFLINE: {
      if (prevNetworkStatus === false) return;
      setTimeout(() => {
        mailboxWindow.send('lost-network-connection');
      }, reconnectDelay);
      globalManager.internetConnection.setStatus(false);
      break;
    }
    default:
      break;
  }
};

const checkAlive = () => {
  pingProcess = spawn('ping', ['www.google.com', '-i', '15']);
  pingProcess.stderr.on('data', err => {
    log(err.toString());
    setConnectionStatus(NETWORK_STATUS.OFFLINE);
  });
  pingProcess.stdout.on('data', data => {
    const status = data.toString().includes('timeout')
      ? NETWORK_STATUS.OFFLINE
      : NETWORK_STATUS.ONLINE;
    setConnectionStatus(status);
  });
};

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
