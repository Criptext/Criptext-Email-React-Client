const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { app } = require('electron');
const myAccount = require('./Account');
const { databasePath } = require('./database/DBEmodel');
const { createPathRecursive } = require('./utils/FileUtils');
const {
  decryptStreamFileWithPassword,
  importDatabaseFromFile
} = require('./database/DBEexporter');

const STREAM_SIZE = 512 * 1024;

/*  Folders & Paths
----------------------------- */
const TempBackupFolderName = 'BackupData';
const TempBackupDirectory = path.join(databasePath, '..', TempBackupFolderName);

const RestoreUnzippedFilename = path.join(TempBackupDirectory, 'unzipped.res');
const RestoreUnencryptedFilename = path.join(
  TempBackupDirectory,
  'unencryp.res'
);

/*  Temp Directory
----------------------------- */
const checkTempBackupDirectory = () => {
  try {
    if (fs.existsSync(TempBackupDirectory)) {
      removeTempBackupDirectoryRecursive(TempBackupDirectory);
    }
    fs.mkdirSync(TempBackupDirectory);
  } catch (e) {
    throw new Error('Unable to create temp folder');
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
  return myAccount.email;
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

const unzipStreamFile = ({ inputFile, outputFile }) => {
  return new Promise((resolve, reject) => {
    const highWaterMark = STREAM_SIZE;
    const reader = fs.createReadStream(inputFile, { highWaterMark });
    const writer = fs.createWriteStream(outputFile);
    reader
      .pipe(zlib.createGunzip())
      .pipe(writer)
      .on('error', reject)
      .on('finish', resolve);
  });
};

const prepareBackupFiles = () => {
  try {
    checkTempBackupDirectory();
  } catch (error) {
    removeTempBackupDirectoryRecursive(TempBackupDirectory);
    return error;
  }
};

/*  Restore Backup 
----------------------------- */
const restoreUnencryptedBackup = async ({ filePath }) => {
  try {
    // Unzip file
    try {
      await unzipStreamFile({
        inputFile: filePath,
        outputFile: RestoreUnzippedFilename
      });
    } catch (unzipError) {
      throw new Error('Failed to unzip backup file');
    }
    // Import to database
    try {
      await importDatabaseFromFile({
        filepath: RestoreUnzippedFilename,
        isStrict: true
      });
    } catch (importError) {
      throw new Error('Failed to import into database');
    }
  } catch (restoreBackupError) {
    throw restoreBackupError;
  } finally {
    removeTempBackupDirectoryRecursive(TempBackupDirectory);
  }
};

const restoreEncryptedBackup = async ({ filePath, password }) => {
  try {
    // Decrypt & Unzip
    try {
      await await decryptStreamFileWithPassword({
        inputFile: filePath,
        outputFile: RestoreUnencryptedFilename,
        password
      });
    } catch (decryptErr) {
      throw new Error('Failed to decrypt backup file');
    }
    // Import to database
    try {
      await importDatabaseFromFile({
        filepath: RestoreUnencryptedFilename,
        isStrict: true
      });
    } catch (importError) {
      throw new Error('Failed to import into database');
    }
  } catch (restoreBackupError) {
    throw restoreBackupError;
  } finally {
    removeTempBackupDirectoryRecursive(TempBackupDirectory);
  }
};

module.exports = {
  createDefaultBackupFolder,
  getDefaultBackupFolder,
  prepareBackupFiles,
  restoreUnencryptedBackup,
  restoreEncryptedBackup
};
