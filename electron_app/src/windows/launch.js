const { BrowserWindow } = require('electron');
const path = require('path');

const openLaunchWindow = () => {
  try {
    const workerWin = new BrowserWindow({
      width: 350,
      height: 220,
      frame: false,
      transparent: true,
      center: true,
      show: true,
      modal: true,
      webPreferences: {
        nodeIntegration: true
      }
    });
    workerWin.loadURL(
      path.join('file://', __dirname, '..', 'windows', `preparing.html`)
    );
    workerWin.webContents.closeDevTools();
    return workerWin;
  } catch (ex) {
    console.error(ex);
  }
  return null;
};

module.exports = {
  openLaunchWindow
};
