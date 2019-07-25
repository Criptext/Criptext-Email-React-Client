const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { app } = require('electron');
const copy = require('recursive-copy');
const myAccount = require('./Account');
const { databasePath } = require('./models');
const { APP_DOMAIN } = require('./utils/const');
const { createPathRecursive, getUserEmailsPath } = require('./utils/FileUtils');
const {
  decryptStreamFileWithPassword,
  encryptStreamFile,
  exportDatabaseToFile,
  generateKeyAndIvFromPassword,
  importDatabaseFromFile
} = require('./dbExporter');

const STREAM_SIZE = 512 * 1024;

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
const ExportUnencryptedFilename = path.join(
  TempBackupDirectory,
  'unencrypt.exp'
);
const ExportZippedFilename = path.join(TempBackupDirectory, 'zipped.exp');
const ExportEncryptedFilename = path.join(TempBackupDirectory, 'encrypted.exp');

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

const zipStreamFile = ({ inputFile, outputFile }) => {
  return new Promise((resolve, reject) => {
    const highWaterMark = STREAM_SIZE;
    const reader = fs.createReadStream(inputFile, { highWaterMark });
    const writer = fs.createWriteStream(outputFile);
    reader
      .pipe(zlib.createGzip())
      .pipe(writer)
      .on('error', reject)
      .on('finish', resolve);
  });
};

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

const prepareBackupFiles = async ({ backupPrevFiles = true }) => {
  try {
    checkTempBackupDirectory();
    if (backupPrevFiles) {
      await createTempDatabaseBackup();
      await createTempEmailsBackup();
    }
  } catch (error) {
    removeTempBackupDirectoryRecursive(TempBackupDirectory);
    return error;
  }
};

/*  Export Backup 
----------------------------- */
const exportBackupUnencrypted = async ({ backupPath }) => {
  try {
    try {
      await exportDatabaseToFile({
        databasePath: TempDatabaseBackupPath,
        outputPath: ExportUnencryptedFilename
      });
    } catch (dbErr) {
      throw new Error('Failed to export database');
    }
    // Compress backup file
    try {
      await zipStreamFile({
        inputFile: ExportUnencryptedFilename,
        outputFile: ExportZippedFilename
      });
    } catch (zipErr) {
      throw new Error('Failed to compress backup file');
    }
    // Move to destination
    try {
      fs.writeFileSync(backupPath, fs.readFileSync(ExportZippedFilename));
    } catch (fileErr) {
      throw new Error('Failed to move backup file');
    }
  } catch (exportBackupError) {
    throw exportBackupError;
  } finally {
    removeTempBackupDirectoryRecursive(TempBackupDirectory);
  }
};

const exportBackupEncrypted = async ({ backupPath, password }) => {
  try {
    // Export database
    try {
      await exportDatabaseToFile({
        databasePath: TempDatabaseBackupPath,
        outputPath: ExportUnencryptedFilename
      });
    } catch (dbErr) {
      throw new Error('Failed to export database');
    }
    // GZip & Encrypt
    try {
      const { key, iv, salt } = generateKeyAndIvFromPassword(password);
      await encryptStreamFile({
        inputFile: ExportUnencryptedFilename,
        outputFile: ExportEncryptedFilename,
        key,
        iv,
        salt
      });
    } catch (encryptErr) {
      throw new Error('Failed to encrypt backup');
    }
    // Move to destination
    try {
      fs.writeFileSync(backupPath, fs.readFileSync(ExportEncryptedFilename));
    } catch (fileErr) {
      throw new Error('Failed to create backup file');
    }
  } catch (exportBackupError) {
    throw exportBackupError;
  } finally {
    removeTempBackupDirectoryRecursive(TempBackupDirectory);
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
        databasePath: databasePath
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
        databasePath: databasePath
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
  exportBackupUnencrypted,
  exportBackupEncrypted,
  restoreUnencryptedBackup,
  restoreEncryptedBackup
};
