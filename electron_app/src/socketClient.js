const { client: WebSocketClient } = require('websocket');
const { SOCKET_URL } = require('./utils/const');
let client, reconnect, messageListener, socketConnection, lastJWT;
let shouldReconnect = true;
const reconnectDelay = 2000;

const setMessageListener = mListener => (messageListener = mListener);
let accounts = [];

const concatJWTs = () => {
  return accounts.reduce((result, account) => {
    if (!result) return account.jwt;
    return `${result}%2C${account.jwt}`;
  }, '');
};

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

const add = accountsData => {
  let accountData;
  for (accountData of accountsData) {
    const { jwt, recipientId } = accountData;
    if (
      accounts.some(
        account => account.recipientId === recipientId && account.jwt === jwt
      )
    )
      continue;
    accounts = accounts.filter(account => account.recipientId !== recipientId);

    accounts.push({
      recipientId,
      jwt
    });
  }
  restartSocket();
};

const remove = recipientId => {
  accounts = accounts.filter(account => account.recipientId === recipientId);
  restartSocket();
};

const start = jwt => {
  lastJWT = jwt || concatJWTs();

  client = new WebSocketClient();
  client.connect(`${SOCKET_URL}?token=${lastJWT}`, 'criptext-protocol');

  client.on('connectFailed', error => {
    reconnect();
    log(error);
  });

  client.on('connect', connection => {
    socketConnection = connection;
    log('Socket connection opened');

    connection.on('error', error => {
      restartSocket(true);
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
      restartSocket(true);
    });
  });

  reconnect = () => {
    if (shouldReconnect) {
      setTimeout(() => {
        log('Websocket reconnecting...');
        start(jwt);
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

const restartSocket = useLastJWT => {
  shouldReconnect = false;
  disconnect();
  client = null;
  setTimeout(() => {
    shouldReconnect = true;
    start(useLastJWT ? lastJWT : null);
  }, reconnectDelay * 2);
};

module.exports = {
  add,
  start,
  setMessageListener,
  disconnect,
  remove,
  restartSocket
};
