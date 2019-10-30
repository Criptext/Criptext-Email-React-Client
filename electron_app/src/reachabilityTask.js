const { SERVER_URL } = require('./utils/const');
const globalManager = require('./globalManager');
const mailboxWindow = require('./windows/mailbox');
const { processEventsQueue } = require('./eventQueueManager');
const reconnectDelay = 2000;
const NETWORK_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline'
};
const https = require('https');
const normalPingDelayMs = 15000;
const failedPingDelayMs = 5000;
let pingFailedCounter = 0;
let reachabilityTask = null;
let checkingConnectionToServer = false;

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

const checkAlive = async force => {
  if (checkingConnectionToServer) return;
  checkingConnectionToServer = true;
  if (reachabilityTask && !force) {
    checkingConnectionToServer = false;
    return;
  }
  clearTimeout(reachabilityTask);
  const prevNetworkStatus = globalManager.internetConnection.getStatus();
  let delayTime = normalPingDelayMs;
  try {
    await ping();
    if (prevNetworkStatus !== NETWORK_STATUS.ONLINE) {
      setConnectionStatus(NETWORK_STATUS.ONLINE);
    }
  } catch (ex) {
    pingFailedCounter++;
    delayTime = failedPingDelayMs;
    if (pingFailedCounter > 3 && prevNetworkStatus !== NETWORK_STATUS.OFFLINE) {
      setConnectionStatus(NETWORK_STATUS.OFFLINE);
      pingFailedCounter = 0;
    }
  }
  reachabilityTask = setTimeout(() => {
    reachabilityTask = null;
    checkAlive();
  }, delayTime);
  checkingConnectionToServer = false;
};

const ping = () => {
  return new Promise((resolve, reject) => {
    const req = https.get(`${SERVER_URL}/ping`, () => {
      resolve();
    });

    req.on('error', () => {
      reject();
    });

    req.end();
  });
};

module.exports = {
  checkAlive
};
