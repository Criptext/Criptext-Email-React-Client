const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const archiver = require('archiver');
const unzipper = require('unzipper');
const { app } = require('electron');
const myAccount = require('./Account');
const { databasePath } = require('./database/DBEmodel');
const { backupFilenameRegex } = require('./utils/RegexUtils');
const { createPathRecursive, store } = require('./utils/FileUtils');
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
const ExportUnencryptedFilename1 = path.join(
  TempBackupDirectory,
  'lite.db'
);
const ExportUnencryptedFilename2 = path.join(
  TempBackupDirectory,
  'complete.db'
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
const zipFilesInDir = ({ inputPath, outputFile}) => {
  return new Promise( (resolve, reject) => {
    const arch = archiver('zip', {
      zlib: { level: 9 }
    })
    const output = fs.createWriteStream(outputFile);
    arch.pipe(output);
    arch.on('finish', data => {
      console.log('finish : ', data, inputPath);
      resolve(data);
    });
    arch.on('error', data => {
      console.log('error : ', data);
      reject(data);
    });
    arch.on('close', data => {
      console.log('close : ', data);
      reject(data);
    });
    arch.on('drain', data => {
      console.log('drain : ', data);
      reject(data);
    });
    arch.directory(inputPath, '/')
    arch.finalize();
  })
}

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

const unzipFileInDir = ({ inputFile, outputPath }) => {
  return new Promise( (resolve, reject) => {
    fs.createReadStream(inputFile).pipe(unzipper.Extract({path: outputPath})).on('close', resolve).on('error', reject);
  })
}

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
const exportBackupUnencrypted = async ({
  backupPath,
  accountObj,
  progressCallback
}) => {
  try {
    try {
      await exportEncryptDatabaseToFile({
        outputPath: ExportUnencryptedFilename1,
        outputPath2: ExportUnencryptedFilename2,
        accountObj,
        progressCallback
      });
    } catch (dbErr) {
      console.log('EPAAAAA : ', dbErr);
      throw new Error('Failed to export database');
    }
    console.log('DONESISIMO');
    // Compress backup file
    try {
      await zipFilesInDir({
        inputPath: TempBackupDirectory,
        outputFile: backupPath
      })
    } catch (zipErr) {
      console.log('HEEEPAAA : ', zipErr);
      throw new Error('Failed to compress backup file');
    }

    console.log('DONESISIMO X2');
    // Move to destination
    try {
      cleanPreviousBackupFilesInFolder(path.join(backupPath, '..'));
      //await store(backupPath, fs.readFileSync(ExportZippedFilename));
    } catch (fileErr) {
      console.log('nOOOOO: ', fileErr);
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
      await store(backupPath, fs.readFileSync(ExportEncryptedFilename));
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
  const start1 = Date.now();
  try {
    // Unzip file
    try {
      await unzipFileInDir({
        inputFile: filePath,
        outputPath: TempBackupDirectory
      });
    } catch (unzipError) {
      throw new Error('Failed to unzip backup file');
    }

    const litePath = path.join(TempBackupDirectory, 'lite.db');

    // Import to database
    try {
      await importDatabaseFromFile({
        filepath: litePath,
        isStrict: true
      });
    } catch (importError) {
      console.log('ERROR 0 : ', importError)
      throw new Error('Failed to import into database');
    }
  } catch (restoreBackupError) {
    throw restoreBackupError;
  } finally {
    //removeTempBackupDirectoryRecursive(TempBackupDirectory);
  }

  setTimeout( () => {
    importSecondPart();
  }, 2000);

  const end1 = Date.now();
  console.log('TIME FOR WHOLE FIRST PART : ', end1 - start1);
};

const importSecondPart = async () => {
  const start2 = Date.now();
  const completePath = path.join(TempBackupDirectory, 'complete.db');
  console.log('INIT SECOND IMPORT ', completePath);
  try {
    await importDatabaseFromFile({
      filepath: completePath,
      isStrict: false
    });
  } catch (ex) {
    console.log('ERROR : ', ex);
  } finally {
    removeTempBackupDirectoryRecursive(TempBackupDirectory);
  }
  console.log('FINISH SECOND IMPORT');
  const end2 = Date.now();
  console.log('TIME FOR WHOLE FIRST PART : ', end2 - start2);
}

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
