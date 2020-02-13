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

const upStepCreateDBEncrypted = async () => {
  const [existingAccount] = await dbManager.getAccount();
  if (existingAccount) {
    await pinWindow.show();
    await dbManager.closeDB();
  } else {
    throw new Error('empty not encrytDatabase');
  }
};

const upStepCheckPIN = async () => {
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

const upStepNewUser = async () => {
  const language = await getUserLanguage();
  initNucleus({ language });
  const settings = { isFromStore, language };
  mySettings.initialize(settings);
  await initClient('@');
  createAppMenu();
  loginWindow.show({});
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

  const loggedAccounts = await dbManager.getAccountByParams({
    isLoggedIn: true
  });
  if (loggedAccounts.length > 0) {
    await upMailboxWindow(loggedAccounts);
  } else {
    const language = await getUserLanguage();
    await initClient('@');
    const settings = { isFromStore, language };
    mySettings.initialize(settings);
    initNucleus({ language });
    createAppMenu();
    loginWindow.show({});
    if (pinWindow) pinWindow.close({ forceClose: true });
    return;
  }
};

const upMailboxWindow = async loggedAccounts => {
  const appSettings = await dbManager.getSettings();
  const settings = Object.assign(appSettings, { isFromStore });
  myAccount.initialize(loggedAccounts);
  mySettings.initialize(settings);
  await initClient(myAccount.recipientId);
  initNucleus({ language: mySettings.language });
  socketClient.add(myAccount.getDataForSocket());
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
  upStepCreateDBEncrypted,
  upStepCheckPIN,
  upStepNewUser
};
