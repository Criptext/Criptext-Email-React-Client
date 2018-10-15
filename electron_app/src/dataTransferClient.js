const DataTransferClient = require('@criptext/data-transfer-client');
const path = require('path');
const fs = require('fs');
const dbExporter = require('./dbExporter');
const { getAccount } = require('./DBManager');
const { databasePath } = require('./models');
const { PROD_DATA_TRANSFER_URL } = require('./utils/const');

/*  Paths
----------------------------- */
const folderName = 'syncData';
const dataTransferDirectory = path.join(databasePath, '..', folderName);
const exportedFileName = `${dataTransferDirectory}/exported`;
const downloadedFileName = `${dataTransferDirectory}/downloaded`;
const decryptedFileName = `${dataTransferDirectory}/decrypted`;
const encryptedFileName = `${dataTransferDirectory}/encrypted`;

let transferClient = {};

/*  Directory
----------------------------- */
const checkDataTransferDirectory = () => {
  try {
    fs.statSync(dataTransferDirectory);
  } catch (e) {
    fs.mkdirSync(dataTransferDirectory);
  }
};

const removeDataTransferDirectoryRecursive = () => {
  if (fs.existsSync(dataTransferDirectory)) {
    fs.readdirSync(dataTransferDirectory).forEach(file => {
      const currentPath = dataTransferDirectory + '/' + file;
      if (fs.lstatSync(currentPath).isDirectory()) {
        removeDataTransferDirectoryRecursive(currentPath);
      } else {
        fs.unlinkSync(currentPath);
      }
    });
    fs.rmdirSync(dataTransferDirectory);
  }
};

/*  Mathods
----------------------------- */
const checkClient = async () => {
  const [account] = await getAccount();
  const token = account ? account.jwt : undefined;
  if (!transferClient.upload || transferClient.token !== token) {
    initializeClient(token);
  }
};

const initializeClient = token => {
  const options = {
    url: PROD_DATA_TRANSFER_URL,
    token,
    timeout: 60000
  };
  transferClient = new DataTransferClient(options);
  transferClient.token = token;
};

class DataTransferClientManager {
  constructor() {
    this.check();
  }

  async check() {
    await checkClient();
  }

  async download(addr) {
    await this.check();
    checkDataTransferDirectory();
    const downloadStream = fs.createWriteStream(downloadedFileName);
    const downloadResponse = await transferClient.download({
      addr,
      downloadStream
    });
    return downloadResponse;
  }

  async upload(uuid) {
    await this.check();
    const uploadStream = fs.createReadStream(encryptedFileName);
    const stat = fs.statSync(encryptedFileName);
    const fileSize = stat.size;
    const uploadResponse = await transferClient.upload({
      uploadStream,
      fileSize,
      uuid
    });
    return uploadResponse;
  }

  async encrypt() {
    const { key, iv } = dbExporter.generateKeyAndIv();
    await dbExporter.encryptStreamFile({
      inputFile: exportedFileName,
      outputFile: encryptedFileName,
      key,
      iv
    });
    return { key, iv };
  }

  async decrypt(key) {
    return await dbExporter.decryptStreamFile({
      inputFile: downloadedFileName,
      outputFile: decryptedFileName,
      key
    });
  }

  async importDatabase() {
    return await dbExporter.importDatabaseFromFile({
      filepath: decryptedFileName,
      databasePath
    });
  }

  async exportDatabase() {
    await this.check();
    checkDataTransferDirectory();
    return await dbExporter.exportDatabaseToFile({
      databasePath,
      outputPath: exportedFileName
    });
  }

  clearSyncData() {
    return removeDataTransferDirectoryRecursive();
  }
}

module.exports = new DataTransferClientManager();
