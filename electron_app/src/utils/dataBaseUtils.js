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
  console.log('needsMigration', needsMigration);
  if (existsDatabaseEncrypted) return 4;
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

const deleteFile = async filepath => {
  await remove(filepath);
};

const getFilenamePath = (node_env, filename) => {
  switch (node_env) {
    case 'development': {
      const a = path
        .join(__dirname, `/${filename}`)
        .replace('/app.asar', '')
        .replace('/src/utils', '');
      return a;
    }
    default: {
      const userDataPath = app.getPath('userData');
      return path
        .join(userDataPath, `/${filename}`)
        .replace('/app.asar', '')
        .replace('/src/utils', '');
    }
  }
};

module.exports = {
  checkDatabaseStep,
  encryptDataBase,
  existsDatabase
};
