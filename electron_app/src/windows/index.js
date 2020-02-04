const keytar = require('keytar');
const dbManager = require('./../database');
const myAccount = require('./../Account');
const mySettings = require('./../Settings');
const loginWindow = require('./login');
const mailboxWindow = require('./mailbox');
const pinWindow = require('./pin');
const { EVENTS, addEvent } = require('./events');
const { createAppMenu } = require('./menu');
const socketClient = require('./../socketClient');
const { initClient, generateEvent } = require('./../clientManager');
const { initNucleus } = require('./../nucleusManager');
const globalManager = require('./../globalManager');
const aliceManager = require('./../aliceManager');
const { isFromStore, getSystemLanguage } = require('./windowUtils');

const sendAPIevent = async event => {
  await generateEvent(event);
};

const upStepDBEncryptedWithoutPIN = async () => {
  const [existingAccount] = await dbManager.getAccount();
  if (existingAccount) {
    await pinWindow.show();
    await dbManager.closeDB();
  } else {
    throw new Error('empty not encrytDatabase');
  }
};

const upStepCheckPINDBEncrypted = async () => {
  const pin = await pinWindow.checkPin();
  if (!pin) {
    globalManager.pinData.set({ pinType: 'new' });
    pinWindow.show();
    return;
  }

  try {
    await dbManager.initDatabaseEncrypted({ key: pin });
  } catch (error) {
    globalManager.pinData.set({ pinType: 'new' });
    pinWindow.show();
    return;
  }

  await upApp({ pin });
};

const upApp = async ({ shouldSave, pin }) => {
  if (pin) {
    if (shouldSave) {
      keytar
        .setPassword('CriptextMailDesktopApp', 'unique', `${pin}`)
        .then(result => {
          console.log('result', result);
        })
        .catch(error => {
          console.log('error', error);
        });
    }
    globalManager.databaseKey.set(pin);
  }

  aliceManager.startAlice();

  const [existingAccount] = await dbManager.getAccountByParams({
    isActive: true
  });
  if (existingAccount) {
    await upMailboxWindow(existingAccount);
  } else {
    const language = await getUserLanguage();
    await initClient();
    const settings = { isFromStore, language };
    mySettings.initialize(settings);
    initNucleus({ language });
    createAppMenu();
    loginWindow.show({});
    if (pinWindow) pinWindow.close({ forceClose: true });
    return;
  }
};

const upMailboxWindow = async existingAccount => {
  const appSettings = await dbManager.getSettings();
  const settings = Object.assign(appSettings, { isFromStore });
  myAccount.initialize(existingAccount);
  mySettings.initialize(settings);
  await initClient();
  initNucleus({ language: mySettings.language });
  socketClient.add({ jwt: myAccount.jwt, recipientId: myAccount.recipientId });
  createAppMenu();
  mailboxWindow.show({ firstOpenApp: true });
  if (pinWindow) pinWindow.close({ forceClose: true });
};

const getUserLanguage = async () => {
  return await getSystemLanguage();
};

addEvent(EVENTS.Up_app, upApp);
addEvent(EVENTS.API_event_tracking, sendAPIevent);

module.exports = {
  dbManager,
  sendAPIevent,
  upApp,
  upStepDBEncryptedWithoutPIN,
  upStepCheckPINDBEncrypted
};
