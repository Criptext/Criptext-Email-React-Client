const { app, BrowserWindow } = require('electron');
const osLocale = require('os-locale');
const globalManager = require('./../globalManager');
const myAccount = require('./../Account');
const mySettings = require('./../Settings');
const { APP_VERSION, NUCLEUS_ID } = require('./../utils/const');

const showWindows = () => {
  const visibleWindows = BrowserWindow.getAllWindows();
  visibleWindows.reverse().forEach(w => {
    w.show();
  });
};

const quit = () => {
  globalManager.forcequit.set(true);
  app.quit();
};

const isFromStore =
  globalManager.isWindowsStore.get() || globalManager.isMAS.get();

const isLinux = process.platform === 'linux';

const isWindows = process.platform === 'win32';

const isMacOS = process.platform === 'darwin';

const isDev = process.env.NODE_ENV === 'development';

const getSystemLanguage = async () => {
  const localeLanguage = await osLocale();
  const isEnglish = localeLanguage.indexOf('en') > -1;
  const isSpanish = localeLanguage.indexOf('es') > -1;
  return isEnglish ? 'en' : isSpanish ? 'es' : 'en';
};

const sendEventToAllWindows = (eventName, params) => {
  const openedWindows = BrowserWindow.getAllWindows();
  return openedWindows.forEach(openWindow => {
    openWindow.webContents.send(eventName, params);
  });
};

const getNucleusPayload = () => ({
  onlyMainProcess: true,
  userId: myAccount.recipientId,
  version: APP_VERSION,
  language: mySettings.language
});

const nucleusTrack = eventName => {
  const data = getNucleusPayload();
  const Nucleus = require('electron-nucleus')(NUCLEUS_ID, data);
  Nucleus.track(eventName);
};

const NUCLEUS_EVENTS = {
  MAILBOX_TRACK: 'MAILBOX_TRACK'
};

module.exports = {
  quit,
  isDev,
  isLinux,
  isWindows,
  isMacOS,
  isFromStore,
  showWindows,
  getSystemLanguage,
  sendEventToAllWindows,
  NUCLEUS_EVENTS,
  nucleusTrack
};
