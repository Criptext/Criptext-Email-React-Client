const { client: WebSocketClient } = require('websocket');
const { SOCKET_URL } = require('./utils/const');
const { percentRegex } = require('./utils/RegexUtils');
const globalManager = require('./globalManager');
const mailboxWindow = require('./windows/mailbox');
const { processEventsQueue } = require('./eventQueueManager');
let client, reconnect, messageListener, socketConnection;
let shouldReconnect = true;
const reconnectDelay = 2000;
const NETWORK_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline'
};
const exec = require('child_process').exec;
const normalPingDelayMs = 15000;
const failedPingDelayMs = 5000;
let pingFailedCounter = 0;
let checkConnTimeout = null;
let checkDelay = normalPingDelayMs;

const setMessageListener = mListener => (messageListener = mListener);

const disconnect = () => {
  if (!socketConnection) return;
  try {
    clearInterval(checkConnTimeout);
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
      processEventsQueue();
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

/*   Check alive
----------------------*/
const isWindows = process.platform === 'win32';

const getDelay = () => checkDelay;

const checkAlive = () => {
  checkConnTimeout = setInterval(() => {
    exec(
      `ping -${isWindows ? 'n' : 'c'} 1 www.criptext.com`,
      { encoding: 'utf8', windowsHide: true },
      (err, stdout, stderr) => {
        let totalLost = 0;
        if (stdout) {
          const stdoutString = stdout.toString();
          if (stdoutString) {
            const match = stdoutString.match(percentRegex);
            if (match) {
              const [lostPackages] = match;
              totalLost = Number(lostPackages.replace('%', ''));
            }
          }
        }
        if (err !== null || !!stderr || totalLost > 50) {
          if (pingFailedCounter === 0) {
            checkDelay = failedPingDelayMs;
            clearInterval(checkConnTimeout);
            checkAlive();
          } else if (pingFailedCounter + 1 > 2) {
            setConnectionStatus(NETWORK_STATUS.OFFLINE);
          }
          pingFailedCounter++;
        } else if (stdout) {
          setConnectionStatus(NETWORK_STATUS.ONLINE);
          if (pingFailedCounter > 0) {
            pingFailedCounter = 0;
            checkDelay = normalPingDelayMs;
            clearInterval(checkConnTimeout);
            checkAlive();
          }
        }
      }
    );
  }, getDelay());
};

process.on('exit', () => {
  checkConnTimeout = null;
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
