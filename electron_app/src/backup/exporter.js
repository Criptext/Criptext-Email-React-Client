const path = require('path');
const {
  copyDatabase,
  getFileSizeInBytes,
  removeTempBackupDirectoryRecursive,
  checkTempBackupDirectory,
  loadJson,
  writeJson,
  deleteFile
} = require('./FileUtils');
const {
  zipStreamFile,
  encryptStreamFile,
  generateKeyAndIvFromPassword
} = require('./Compress');
const { initDatabaseEncrypted, Account } = require('../database/DBEmodel');
const { exportEncryptDatabaseToFile } = require('./databaseExport');
const { APP_DOMAIN } = require('../utils/const');

const BACKUP_FILES_COUNT = 5;
const startTimeout = setTimeout(() => {
  start();
}, 5000);

let key;
let password;

const start = async () => {
  var args = process.argv.slice(2);
  const dbPath = args[0];
  const backupPath = args[1];
  const recipientId = args[2];
  const tempBackupDirectory = args[3];

  if (!key) {
    throw new Error(`Database key was never received`);
  }

  const outputPath = path.join(tempBackupDirectory, 'unencrypt.exp');

  checkTempBackupDirectory(tempBackupDirectory);
  copyDatabase(dbPath, tempBackupDirectory);

  let account;
  try {
    await initDatabaseEncrypted({
      key: key,
      dbpath: path.join(tempBackupDirectory, 'CriptextEncrypt.db'),
      sync: false
    });
    account = await Account().findOne({
      where: {
        recipientId
      }
    });
  } catch (ex) {
    removeTempBackupDirectoryRecursive(tempBackupDirectory);
    throw new Error(`Error connecting to db ${ex}`);
  }

  const [reId, domain = APP_DOMAIN] = recipientId.split('@');
  try {
    const accountObj = {
      email: `${reId}@${domain}`,
      username: reId,
      domain: domain,
      name: account.name,
      id: account.id
    };

    await exportEncryptDatabaseToFile({
      outputPath,
      accountObj,
      progressCallback: handleProgress,
      databaseKey: key
    });
  } catch (ex) {
    removeTempBackupDirectoryRecursive(tempBackupDirectory);
    throw new Error(`Error creating backup ${ex}`);
  }

  try {
    if (password) {
      const { key, iv, salt } = generateKeyAndIvFromPassword(password);
      await encryptStreamFile({
        inputFile: outputPath,
        outputFile: backupPath,
        key,
        iv,
        salt
      });
    } else {
      await zipStreamFile({
        inputFile: outputPath,
        outputFile: backupPath
      });
    }
  } catch (zipErr) {
    removeTempBackupDirectoryRecursive(tempBackupDirectory);
    throw new Error(`Failed to compress backup file ${zipErr}`);
  }

  const backupSize = getFileSizeInBytes(backupPath);
  process.send({
    step: 'end',
    backupSize
  });
  removeTempBackupDirectoryRecursive(tempBackupDirectory);

  if (process.env.AUTOBACKUP) {
    handleRegisterBackup(`${reId}@${domain}`, backupPath);
  }

  await sleep(1000);
  process.exit(0);
};

const sleep = time => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

const handleRegisterBackup = (email, backupPath) => {
  const audit = loadJson(process.env.AUDITPATH);
  if (!audit[email]) {
    audit[email] = [];
  }
  if (audit[email].length < BACKUP_FILES_COUNT) {
    audit[email].push(backupPath);
    writeJson(process.env.AUDITPATH, audit);
  } else {
    const deletePath = audit[email].shift();
    deleteFile(deletePath);
    audit[email].push(backupPath);
    writeJson(process.env.AUDITPATH, audit);
  }
};

const handleProgress = progress => {
  process.send(progress);
};

process.on('message', data => {
  if (data.step !== 'init') return;

  key = data.key;
  password = data.password;

  clearTimeout(startTimeout);
  start();
});
