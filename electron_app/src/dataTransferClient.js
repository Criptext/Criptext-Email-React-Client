const DataTransferClient = require('@criptext/data-transfer-client');
const path = require('path');
const fs = require('fs');
const { getAccount } = require('./DBManager');
const { databasePath } = require('./models');
const dbExporter = require('./dbExporter');
const { PROD_DATA_TRANSFER_URL } = require('./utils/const');

const dataTransferDirectory = path.join(databasePath, '..', 'linkData');
const encryptedFileName = `${dataTransferDirectory}/downloaded`;
const decryptedFileName = `${dataTransferDirectory}/decrypted`;

let transferClient = {};

const checkDataTransferDirectory = () => {
  try {
    fs.statSync(dataTransferDirectory);
  } catch (e) {
    fs.mkdirSync(dataTransferDirectory);
  }
};

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

  async download(address) {
    await this.check();
    checkDataTransferDirectory();
    const writeStream = fs.createWriteStream(encryptedFileName);
    await transferClient.download(address, writeStream);
  }

  async upload(stream, fileSize) {
    await this.check();
    checkDataTransferDirectory();
    return transferClient.upload(stream, fileSize);
  }

  async decrypt(key) {
    return await dbExporter.decryptStreamFile({
      inputFile: encryptedFileName,
      outputFile: decryptedFileName,
      key
    });
  }

  async importDatabase() {
    await dbExporter.importDatabaseFromFile({
      filepath: decryptedFileName,
      databasePath
    });
  }
}

module.exports = new DataTransferClientManager();
