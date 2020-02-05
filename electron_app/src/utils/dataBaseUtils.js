/* process */
require('dotenv').config();

const path = require('path');
const { app } = require('electron');
const { checkIfExists, remove } = require('./FileUtils');
const {
  exportNotEncryptDatabaseToFile,
  importDatabaseFromFile
} = require('./../database/DBEexporter');

const existsDatabase = filename => {
  if (process.env.NODE_ENV === 'test') return false;
  const myDBPath = getFilenamePath(process.env.NODE_ENV, filename);
  return checkIfExists(myDBPath);
};

const checkDatabaseStep = async dbManager => {
  const existsDatabaseNormal = existsDatabase('Criptext.db');
  const existsDatabaseEncrypted = existsDatabase('CriptextEncrypt.db');
  let needsMigration;
  if (existsDatabaseNormal) {
    await dbManager.createTables();
    needsMigration = !(await dbManager.hasColumnPreKeyRecordLength());
  }
  if (existsDatabaseEncrypted) {
    if (existsDatabaseNormal) {
      const myEDBPath = getFilenamePath(
        process.env.NODE_ENV,
        'CriptextEncrypt.db'
      );
      await deleteFile(myEDBPath);
      return 2;
    }
    return 4;
  }
  if (!existsDatabaseEncrypted && !existsDatabaseNormal) return 3;
  if (!existsDatabaseEncrypted && existsDatabaseNormal && !needsMigration)
    return 2;
  if (!existsDatabaseEncrypted && existsDatabaseNormal && needsMigration)
    return 1;
};

const encryptDataBase = async () => {
  const myOldDBPath = getFilenamePath(process.env.NODE_ENV, 'Criptext.db');
  const outputPath = getFilenamePath(process.env.NODE_ENV, 'oldDB.criptext');
  await exportNotEncryptDatabaseToFile({
    databasePath: myOldDBPath,
    outputPath
  });
  await importDatabaseFromFile({ filepath: outputPath });
  await deleteFile(myOldDBPath);
  await deleteFile(outputPath);
};

const deleteNotEncryptDatabase = async () => {
  const myOldDBPath = getFilenamePath(process.env.NODE_ENV, 'Criptext.db');
  await deleteFile(myOldDBPath);
};

const deleteFile = async filepath => {
  await remove(filepath);
};

const getFilenamePath = (node_env, filename) => {
  const currentDirToReplace =
    process.platform === 'win32' ? '\\src\\utils' : '/src/utils';
  switch (node_env) {
    case 'test': {
      return './src/__integrations__/test.db';
    }
    case 'development': {
      const a = path
        .join(__dirname, `/${filename}`)
        .replace('/app.asar', '')
        .replace(currentDirToReplace, '');
      return a;
    }
    default: {
      const userDataPath = app.getPath('userData');
      return path
        .join(userDataPath, `/${filename}`)
        .replace('/app.asar', '')
        .replace(currentDirToReplace, '');
    }
  }
};

module.exports = {
  checkDatabaseStep,
  deleteNotEncryptDatabase,
  encryptDataBase,
  existsDatabase
};
