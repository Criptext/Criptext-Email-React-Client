const fs = require('fs');
const path = require('path');
const { initDatabaseEncrypted, getDB } = require('../database/DBEmodel');
const { workerData, parentPort } = require('worker_threads')
const { exportEncryptDatabaseToFile } = require('./DBEexporter');

const getTempDirectory = nodeEnv => {
  const folderName = 'BackupTempData'
  const currentDirToReplace =
    process.platform === 'win32' ? '\\src\\database' : '/src/database';
  switch (nodeEnv) {
    case 'development': {
      return path.join(
        __dirname,
        `../../${folderName}`
      );
    }
    default: {
      const userDataPath = app.getPath('userData');
      return path
        .join(userDataPath, folderName)
        .replace('/app.asar', '')
        .replace(currentDirToReplace, '');
    }
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

const checkTempBackupDirectory = () => {
  const tempBackupDirectory = getTempDirectory(process.env.NODE_ENV);
  try {
    if (fs.existsSync(tempBackupDirectory)) {
      removeTempBackupDirectoryRecursive(tempBackupDirectory);
    }
    console.log(tempBackupDirectory);
    fs.mkdirSync(tempBackupDirectory);
  } catch (e) {
    throw new Error('Unable to create temp folder');
  }
};

const copyDatabase = dbPath => {
  const tempBackupDirectory = getTempDirectory(process.env.NODE_ENV);

  const dbshm = `${dbPath}-shm`;
  const dbwal = `${dbPath}-wal`;

  if (!fs.existsSync(dbPath)) {
    throw new Error('No Database Found');
  }

  fs.copyFileSync(dbPath, path.join(tempBackupDirectory, 'CriptextEncrypt.db'));

  if (fs.existsSync(dbshm)) {
    fs.copyFileSync(dbshm, path.join(tempBackupDirectory, 'CriptextEncrypt.db-shm'));
  }
  if (fs.existsSync(dbwal)) {
    fs.copyFileSync(dbwal, path.join(tempBackupDirectory, 'CriptextEncrypt.db-wal'));
  }
}

const start = async () => {
  try {
    const tempBackupDirectory = getTempDirectory(process.env.NODE_ENV);

    initDatabaseEncrypted({
      key: '2004',
      path: path.join(tempBackupDirectory, 'CriptextEncrypt.db'),
      sync: false
    })
  } catch (ex) {
    console.log(ex);
  }
  
  console.log(workerData, getDB());

  checkTempBackupDirectory();
  copyDatabase(workerData.dbPath);

  try {
    await exportEncryptDatabaseToFile({});
  } catch (ex) {
    console.log(ex);
  }
};

start();