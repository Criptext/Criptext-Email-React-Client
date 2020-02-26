const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { app } = require('electron');
const myAccount = require('./Account');
const { databasePath } = require('./database/DBEmodel');
const { backupFilenameRegex } = require('./utils/RegexUtils');
const { createPathRecursive } = require('./utils/FileUtils');
const {
  decryptStreamFileWithPassword,
  encryptStreamFile,
  exportEncryptDatabaseToFile,
  generateKeyAndIvFromPassword,
  importDatabaseFromFile
} = require('./database/DBEexporter');

const STREAM_SIZE = 512 * 1024;

/*  Folders & Paths
----------------------------- */
const TempBackupFolderName = 'BackupData';
const TempBackupDirectory = path.join(databasePath, '..', TempBackupFolderName);

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

const cleanPreviousBackupFilesInFolder = pathToClean => {
  try {
    const files = fs.readdirSync(pathToClean);
    const filtered = files.filter(name => backupFilenameRegex.test(name));
    filtered.forEach(filename => {
      fs.unlinkSync(path.join(pathToClean, filename));
    });
  } catch (cleanErr) {
    return cleanErr;
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

const prepareBackupFiles = () => {
  try {
    checkTempBackupDirectory();
  } catch (error) {
    removeTempBackupDirectoryRecursive(TempBackupDirectory);
    return error;
  }
};

const getFileSizeInBytes = filename => {
  try {
    const stats = fs.statSync(filename);
    return stats.size;
  } catch (error) {
    return 0;
  }
};

/*  Export Backup 
----------------------------- */
const exportBackupUnencrypted = async ({ backupPath, accountObj }) => {
  try {
    try {
      await exportEncryptDatabaseToFile({
        outputPath: ExportUnencryptedFilename,
        accountObj
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
      cleanPreviousBackupFilesInFolder(path.join(backupPath, '..'));
      fs.writeFileSync(backupPath, fs.readFileSync(ExportZippedFilename));
    } catch (fileErr) {
      throw new Error('Failed to move backup file');
    }
    return getFileSizeInBytes(backupPath);
  } catch (exportBackupError) {
    throw exportBackupError;
  } finally {
    removeTempBackupDirectoryRecursive(TempBackupDirectory);
  }
};

const exportBackupEncrypted = async ({ backupPath, password, accountObj }) => {
  try {
    // Export database
    try {
      await exportEncryptDatabaseToFile({
        outputPath: ExportUnencryptedFilename,
        accountObj
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
      cleanPreviousBackupFilesInFolder(path.join(backupPath, '..'));
      fs.writeFileSync(backupPath, fs.readFileSync(ExportEncryptedFilename));
    } catch (fileErr) {
      throw new Error('Failed to create backup file');
    }
    return getFileSizeInBytes(backupPath);
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
  exportBackupUnencrypted,
  exportBackupEncrypted,
  prepareBackupFiles,
  restoreUnencryptedBackup,
  restoreEncryptedBackup
};
