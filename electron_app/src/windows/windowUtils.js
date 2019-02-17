const { app, BrowserWindow } = require('electron');
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

module.exports = {
  isDev,
  isLinux,
  isWindows,
  isMacOS,
  isFromStore,
  showWindows,
  quit
};
