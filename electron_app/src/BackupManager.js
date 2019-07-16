const path = require('path');
const { app } = require('electron');
const myAccount = require('./Account');
const { databasePath } = require('./models');
const { APP_DOMAIN } = require('./utils/const');
const { createPathRecursive } = require('./utils/FileUtils');
const {
  encryptStreamFile,
  exportDatabaseToFile,
  generateKeyAndIvFromPassword
} = require('./dbExporter');

const getDefaultBackupFolder = () => {
  const username = myAccount.recipientId.includes('@')
    ? myAccount.recipientId
    : `${myAccount.recipientId}@${APP_DOMAIN}`;
  return path.join(app.getPath('documents'), 'Criptext', username, 'backups');
};

const createDefaultBackupFolder = () => {
  const backupPath = getDefaultBackupFolder();
  createPathRecursive(backupPath);
  return backupPath;
};

const exportBackupFile = async ({ customPath, password }) => {
  const defaultFilename = password ? 'exported.enc' : 'exported.db';
  const backupPath =
    customPath || path.join(getDefaultBackupFolder(), defaultFilename);
  try {
    await exportDatabaseToFile({
      databasePath,
      outputPath: backupPath
    });
  } catch (exportErr) {
    return Promise.reject({ name: 'Export error', error: exportErr });
  }
  if (!password) return Promise.resolve(); // Saved in text file

  const { key, iv } = generateKeyAndIvFromPassword(password);
  const tmpOutputPath = path.join(backupPath, '..', 'temp.enc');
  try {
    await encryptStreamFile({
      inputFile: backupPath,
      outputFile: tmpOutputPath,
      key,
      iv
    });
  } catch (encryptErr) {
    return Promise.reject({ name: 'Encrypt error', error: encryptErr });
  }
  return Promise.resolve();
};

module.exports = {
  createDefaultBackupFolder,
  exportBackupFile,
  getDefaultBackupFolder
};
