const { app } = require('electron');
const mailboxWindow = require('./windows/mailbox');
const pinWindow = require('./windows/pin.js');
const globalManager = require('./globalManager');
const { resetKeyDatabase } = require('./database/DBEmanager');
const keytar = require('keytar');
const path = require('path');
const socket = require('./socketClient');
const filesScript = require('./filescript/handler');
const fileUtils = require('./utils/FileUtils');
const myAccount = require('./Account');
const recoveryKeyManager = require('./recoveryKey');

let resetKeyParams;

const initialize = params => {
  resetKeyParams = params;
  mailboxWindow.close();
  socket.disconnect();

  globalManager.pinData.set({ pinType: 'reset' });
  pinWindow.show();
};

const setKeyEmailBodies = async pin => {
  const accountEmail = myAccount.email;
  const userEmailsPath = fileUtils.getUserEmailsPath(
    process.env.NODE_ENV,
    accountEmail
  );
  const userEmailsCopyPath = path.join(userEmailsPath, '../emails-copy');
  await filesScript.start({
    inPath: userEmailsPath,
    outPath: userEmailsCopyPath,
    pass: pin
  });
};

const start = async () => {
  const { newPin, recoveryKeyData, saveInKeyChain } = resetKeyParams;
  const oldPin = globalManager.databaseKey.get();
  const accountEmail = myAccount.email;
  try {
    const userEmailsPath = fileUtils.getUserEmailsPath(
      process.env.NODE_ENV,
      accountEmail
    );
    const userEmailsCopyPath = path.join(userEmailsPath, '../emails-copy');
    const result = await filesScript.start({
      inPath: userEmailsPath,
      outPath: userEmailsCopyPath,
      pass: newPin,
      oldPass: oldPin
    });

    if (!result) {
      app.relaunch();
      app.exit(0);
    }
    await resetKeyDatabase(newPin);
    const { encryptedPin, salt, iv } = recoveryKeyData;
    const storePath = recoveryKeyManager.getPath(process.env.NODE_ENV);
    const data = salt.concat(iv).concat(encryptedPin);
    try {
      await fileUtils.store(storePath, Uint8Array.from(data));
    } catch (e) {
      console.error(e);
    }

    if (saveInKeyChain) {
      keytar
        .setPassword('CriptextMailDesktopApp', 'unique', `${newPin}`)
        .then(result => {
          console.log('result', result);
        })
        .catch(error => {
          console.log('error', error);
        });
    } else {
      keytar.deletePassword('CriptextMailDesktopApp', 'unique');
    }
  } catch (ex) {
    console.log(ex);
  }
  app.relaunch();
  app.exit(0);
};

module.exports = {
  initialize,
  setKeyEmailBodies,
  start
};
