const path = require('path');
const url = require('url');

const loginUrl =
  process.env.LOGIN_URL ||
  url.format({
    pathname: path.join(__dirname, './app/email_login/index.html'),
    protocol: 'file:',
    slashes: true
  });

const pinUrl =
  process.env.PIN_URL ||
  url.format({
    pathname: path.join(__dirname, './app/email_pin/index.html'),
    protocol: 'file:',
    slashes: true
  });

const mailboxUrl =
  process.env.MAILBOX_URL ||
  url.format({
    pathname: path.join(__dirname, './app/email_mailbox/index.html'),
    protocol: 'file:',
    slashes: true
  });

const loadingUrl =
  process.env.LOADING_URL ||
  url.format({
    pathname: path.join(__dirname, './app/email_loading/index.html'),
    protocol: 'file:',
    slashes: true
  });

const composerUrl =
  process.env.COMPOSER_URL ||
  url.format({
    pathname: path.join(__dirname, './app/email_composer/index.html'),
    protocol: 'file:',
    slashes: true
  });

module.exports = {
  loginUrl,
  pinUrl,
  mailboxUrl,
  loadingUrl,
  composerUrl
};
