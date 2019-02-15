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

module.exports = {
  isFromStore,
  showWindows,
  quit
};
