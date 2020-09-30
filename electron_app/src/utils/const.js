/* process */
require('dotenv').config();
const {
  version,
  nucleusId,
  criptextInstallerType
} = require('./../../package.json');

const API_CLIENT_VERSION = '11.0.0';
const LINK_DEVICES_FILE_VERSION = '6';
const PROD_SOCKET_URL = 'wss://socket.criptext.com';
const PROD_SERVER_URL = 'https://api.criptext.com';
const PROD_DATA_TRANSFER_URL = 'https://transfer.criptext.com';
const PROD_ACCOUNT_URL = 'https://account.criptext.com';
const FILE_SERVER_APP_ID = 'qynhtyzjrshazxqarkpy';
const FILE_SERVER_KEY = 'lofjksedbxuucdjjpnby';
const PROD_APP_DOMAIN = 'criptext.com';
const NEWS_SERVER_URL = 'https://news.criptext.com';
const DEFAULT_PIN = 'aaaa';

const isDevelopment = process.env.NODE_ENV === 'development';
if (isDevelopment) {
  console.log('\x1b[33m%s\x1b[0m', `\n\t Mode: ${process.env.NODE_ENV}\n`);
}

const API_TRACKING_EVENT = {
  COMPOSER_OPENED: 23,
  APP_OPENED: 24
};

module.exports = {
  API_TRACKING_EVENT,
  FILE_SERVER_APP_ID,
  FILE_SERVER_KEY,
  APP_DOMAIN: isDevelopment ? process.env.DEV_APP_DOMAIN : PROD_APP_DOMAIN,
  SERVER_URL: isDevelopment ? process.env.DEV_SERVER_URL : PROD_SERVER_URL,
  SOCKET_URL: isDevelopment ? process.env.DEV_SOCKET_URL : PROD_SOCKET_URL,
  DATA_TRANSFER_URL: isDevelopment
    ? process.env.DEV_DATA_TRANSFER_URL
    : PROD_DATA_TRANSFER_URL,
  NEWS_SERVER_URL,
  API_CLIENT_VERSION,
  LINK_DEVICES_FILE_VERSION,
  APP_VERSION: isDevelopment ? '0.0.0' : version,
  NUCLEUS_ID: isDevelopment
    ? process.env.DEV_NUCLEUS_ID
    : process.env.PROD_NUCLEUS_ID || nucleusId,
  INSTALLER_TYPE: criptextInstallerType,
  DEFAULT_PIN,
  ACCOUNT_URL: isDevelopment ? process.env.DEV_ACCOUNT_URL : PROD_ACCOUNT_URL
};
