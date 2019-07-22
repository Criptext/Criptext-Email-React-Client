const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const copy = require('recursive-copy');
const myAccount = require('./Account');
const { databasePath } = require('./models');
const { APP_DOMAIN } = require('./utils/const');
const { createPathRecursive, getUserEmailsPath } = require('./utils/FileUtils');
const {
  encryptStreamFile,
  exportDatabaseToFile,
  generateKeyAndIvFromPassword
} = require('./dbExporter');

/*  Folders & Paths
----------------------------- */
const TempBackupFolderName = 'BackupData';
const TempDatabaseBackupFileName = 'CriptextBackup.db';
const TempEmailsBackupFolderName = 'EmailsBackup';
const TempBackupDirectory = path.join(databasePath, '..', TempBackupFolderName);
const TempDatabaseBackupPath = path.join(
  TempBackupDirectory,
  TempDatabaseBackupFileName
);
const TempEmailsBackupPath = path.join(
  TempBackupDirectory,
  TempEmailsBackupFolderName
);
const U_ExportedFileName = path.join(TempBackupDirectory, 'backup.db');
const E_ExportedFileName = path.join(TempBackupDirectory, 'backup.enc');

/*  Temp Directory
----------------------------- */
const checkTempBackupDirectory = () => {
  try {
    fs.statSync(TempBackupDirectory);
  } catch (e) {
    fs.mkdirSync(TempBackupDirectory);
  }
};

const removeTempBackupDirectoryRecursive = pathToDelete => {
  if (fs.existsSync(pathToDelete)) {
    fs.readdirSync(pathToDelete).forEach(file => {
      const currentPath = path.join(pathToDelete, file);
      if (fs.lstatSync(currentPath).isDirectory()) {
        removeTempBackupDirectoryRecursive(currentPath);
      } else {
        fs.unlinkSync(currentPath);
      }
    });
    fs.rmdirSync(pathToDelete);
  }
};

/*  Default Directory
----------------------------- */
function getUsername() {
  return myAccount.recipientId.includes('@')
    ? myAccount.recipientId
    : `${myAccount.recipientId}@${APP_DOMAIN}`;
}

const getDefaultBackupFolder = () => {
  return path.join(
    app.getPath('documents'),
    'Criptext',
    getUsername(),
    'backups'
  );
};

const createDefaultBackupFolder = () => {
  const backupPath = getDefaultBackupFolder();
  return createPathRecursive(backupPath);
};

/*  Methods
----------------------------- */
const createTempDatabaseBackup = () => {
  return new Promise((resolve, reject) => {
    fs.copyFile(databasePath, TempDatabaseBackupPath, cpErr => {
      if (cpErr) reject({ error: 'Preparing backup error' });
      resolve();
    });
  });
};

const createTempEmailsBackup = () => {
  const EmailsFolder = getUserEmailsPath(process.env.NODE_ENV, getUsername());
  return new Promise((resolve, reject) => {
    try {
      copy(EmailsFolder, TempEmailsBackupPath);
      resolve();
    } catch (error) {
      reject({ error: 'Preparing backup error' });
    }
  });
};

const prepareBackupFiles = async () => {
  try {
    checkTempBackupDirectory();
    await createTempDatabaseBackup();
    await createTempEmailsBackup();
  } catch (error) {
    removeTempBackupDirectoryRecursive(TempBackupDirectory);
    return error;
  }
};

const exportBackupFile = async ({ customPath, moveToDest = true }) => {
  try {
    try {
      await exportDatabaseToFile({
        databasePath: TempDatabaseBackupPath,
        outputPath: U_ExportedFileName
      });
    } catch (dbErr) {
      throw new Error('Backup database error');
    }
    try {
      if (moveToDest) {
        fs.writeFileSync(customPath, fs.readFileSync(U_ExportedFileName));
      }
    } catch (fileErr) {
      throw new Error('Backup create file error');
    }
  } catch (error) {
    return error;
  } finally {
    removeTempBackupDirectoryRecursive(TempBackupDirectory);
  }
};

const encryptBackupFile = async ({ customPath, password }) => {
  try {
    try {
      const { key, iv } = generateKeyAndIvFromPassword(password);
      await encryptStreamFile({
        inputFile: U_ExportedFileName,
        outputFile: E_ExportedFileName,
        key,
        iv
      });
    } catch (encryptErr) {
      throw new Error('Encrypting error');
    }
    // Move to destination
    try {
      fs.writeFileSync(customPath, fs.readFileSync(E_ExportedFileName));
    } catch (fileErr) {
      throw new Error('Backup create file error');
    }
  } catch (error) {
    return error;
  } finally {
    removeTempBackupDirectoryRecursive(TempBackupDirectory);
  }
};

module.exports = {
  createDefaultBackupFolder,
  getDefaultBackupFolder,
  prepareBackupFiles,
  exportBackupFile,
  encryptBackupFile
};
