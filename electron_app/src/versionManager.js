const { app } = require('electron');
const path = require('path');
const fs = require('fs');
const { RELEASE_VERSION } = require('./utils/consts');
const userDataPath = app.getPath('userData');
const releasePath = path.join(userDataPath, '/release.txt');

const createVersionFile = async () => {
  await fs.appendFile(releasePath, RELEASE_VERSION, err => {
    if (err) throw err;
  });
};

const checkInstalledVersion = () => {
  try {
    const installedRelease = fs.readFileSync(releasePath, {
      encoding: 'utf8',
      flag: 'w'
    });
    if (installedRelease !== RELEASE_VERSION) return false;
    return true;
  } catch (e) {
    if (e) return false;
  }
};

const removePrevFiles = () => {
  const prevDBPath = path.join(userDataPath, '/Criptext.db');
  try {
    fs.unlinkSync(prevDBPath);
    return true;
  } catch (e) {
    if (e) return false;
  }
};

module.exports = {
  createVersionFile,
  checkInstalledVersion,
  removePrevFiles
};
