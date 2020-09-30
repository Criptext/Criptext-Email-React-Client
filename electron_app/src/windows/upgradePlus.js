const { BrowserWindow } = require('electron');
const language = require('../lang/index');
const { ACCOUNT_URL } = require('../utils/const');

const openUpgradeToPlusWindow = token => {
  try {
    const workerWin = new BrowserWindow({
      width: 700,
      height: 560,
      transparent: false,
      center: true,
      show: true,
      modal: false,
      webPreferences: {
        nodeIntegration: true
      }
    });
    workerWin.loadURL(
      `${ACCOUNT_URL}?#/billing?lang=${language.currentLanguage}&token=${token}`
    );
    workerWin.webContents.closeDevTools();
    return workerWin;
  } catch (ex) {
    console.error(ex);
  }
  return null;
};

module.exports = {
  openUpgradeToPlusWindow
};
