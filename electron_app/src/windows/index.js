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
const { generateEvent } = require('./../clientManager');
const { deleteEncryptedDatabase } = require('./../utils/dataBaseUtils');
const { initNucleus } = require('./../nucleusManager');
const globalManager = require('./../globalManager');
const aliceManager = require('./../aliceManager');
const { isFromStore, getSystemLanguage } = require('./windowUtils');
const { openLaunchWindow } = require('./launch.js');
const { DEFAULT_PIN } = require('./../utils/const');

const sendAPIevent = async event => {
  await generateEvent({ event, recipientId: myAccount.recipientId });
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

/* eslint no-empty: ["error", { "allowEmptyCatch": true }] */
const upStepCheckPIN = async () => {
  try {
    const fallback = await dbManager.rawCheckPin(DEFAULT_PIN);
    if (fallback) {
      if (fallback.length) {
        myAccount.initialize(fallback);
        globalManager.pinData.set({ pinType: 'signin' });
        pinWindow.show();
      } else {
        await deleteEncryptedDatabase();
        upStepNewUser();
      }
      return;
    }
  } catch (error) {}

  const pin = await pinWindow.checkPin();
  if (!pin) {
    globalManager.pinData.set({ pinType: 'new' });
    pinWindow.show();
    return;
  }

  try {
    await dbManager.rawCheckPin(pin);
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

  let launchWindow;
  await dbManager.initDatabaseEncrypted({ key: pin }, () => {
    launchWindow = openLaunchWindow();
    if (pinWindow) pinWindow.close({ forceClose: true });
  });

  const loggedAccounts = await dbManager.getAccountByParams({
    isLoggedIn: true
  });

  if (loggedAccounts.length > 0) {
    await upMailboxWindow(loggedAccounts);
  } else {
    const language = await getUserLanguage();
    const settings = { isFromStore, language };
    mySettings.initialize(settings);
    initNucleus({ language });
    createAppMenu();
    loginWindow.show({});
    if (pinWindow) pinWindow.close({ forceClose: true });
  }
  if (launchWindow) launchWindow.close();
};

const upMailboxWindow = async loggedAccounts => {
  const appSettings = await dbManager.getSettings();
  const settings = Object.assign(appSettings, { isFromStore });
  myAccount.initialize(loggedAccounts);
  mySettings.initialize(settings);
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
