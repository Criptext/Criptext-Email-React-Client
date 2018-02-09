const loginUrl = 
  process.env.LOGIN_URL || 
  url.format({
    pathname: path.join(__dirname, '../../email_login/build/index.html'),
    protocol: 'file:',
    slashes: true
  });

const modalUrl =
  process.env.DIALOG_URL || 
  url.format({
    pathname: path.join(__dirname, '../../email_dialog/build/index.html'),
    protocol: 'file:',
    slashes: true
  });

const mailboxUrl =
  process.env.MAILBOX_URL ||
  'http://localhost:3000' ||
  url.format({
    pathname: path.join(__dirname, './src/app/email_mailbox/index.html'),
    protocol: 'file:',
    slashes: true
  });

const loadingUrl =
  process.env.LOADING_URL || 
  url.format({
    pathname: path.join(__dirname, './src/app/email_loading/index.html'),
    protocol: 'file:',
    slashes: true
  });

const composerUrl =
  process.env.COMPOSER_URL ||
  url.format({
    pathname: path.join(__dirname, './src/app/email_composer/index.html'),
    protocol: 'file:',
    slashes: true
  });


module.exports = {
  loginUrl,
  modalUrl,
  mailboxUrl,
  loadingUrl,
  composerUrl
}
