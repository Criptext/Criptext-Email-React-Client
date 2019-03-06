const { app, BrowserWindow } = require('electron');
const osLocale = require('os-locale');
const globalManager = require('./../globalManager');

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

module.exports = {
  quit,
  isDev,
  isLinux,
  isWindows,
  isMacOS,
  isFromStore,
  showWindows,
  getSystemLanguage
};
