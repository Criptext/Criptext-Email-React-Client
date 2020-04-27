const { BrowserWindow } = require('electron');
const language = require('../lang/index');

const openUpgradeToPlusWindow = token => {
  try {
    const workerWin = new BrowserWindow({
      width: 400,
      height: 700,
      transparent: false,
      center: true,
      show: true,
      modal: false,
      webPreferences: {
        nodeIntegration: true
      }
    });
    workerWin.loadURL(
      `https://admin.criptext.com/?#/account/billing?token=${token}&lang=${
        language.currentLanguage
      }`
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
