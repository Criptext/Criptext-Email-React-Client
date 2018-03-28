const { client: WebSocketClient } = require('websocket');
const SOCKET_URL = process.env.REACT_APP_SOCKETSERVER_URL;
var client, reconnect, messageListener;
var reconnectDelay = 1000;

const setMessageListener = mListener => (messageListener = mListener);

const start = account => {
  if (client) {
    client.abort();
  }
  client = new WebSocketClient();

  client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
    reconnect();
  });

  client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');
    reconnectDelay = 1000;
    connection.on('error', function(error) {
      console.log('Connection Error: ' + error.toString());
      reconnect();
    });
    connection.on('close', function() {
      console.log('criptext-protocol Connection Closed');
      reconnect();
    });
    connection.on('message', function(data) {
      const message = JSON.parse(data.utf8Data);
      messageListener(message);
      if (data.type === 'utf8') {
        console.log("Received: '" + data.utf8Data + "'");
      }
    });
  });

  client.connect(
    `${SOCKET_URL}?recipientId=${account.recipientId}&deviceId=${
      account.deviceId
    }`,
    'criptext-protocol'
  );

  reconnect = () => {
    setTimeout(() => {
      console.log(`Websocket reconnecting using ${account.recipientId}...`);
      start(account);
    }, reconnectDelay);
    reconnectDelay *= 2;
  };
};

module.exports = {
  start,
  setMessageListener
};
