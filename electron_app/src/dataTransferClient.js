const DataTransferClient = require('@criptext/data-transfer-client');
const path = require('path');
const fs = require('fs');
const dbExporter = require('./dbExporter');
const { getAccount } = require('./DBManager');
const { databasePath } = require('./models');
const { DATA_TRANSFER_URL } = require('./utils/const');

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
    url: DATA_TRANSFER_URL,
    token,
    timeout: 60 * 1000
  };
  transferClient = new DataTransferClient(options);
  transferClient.token = token;
};

const checkExpiredSession = async (
  requirementResponse,
  initialRequest,
  requestParams
) => {
  if (requirementResponse.statusCode === 401) {
    await checkClient();
    return initialRequest(requestParams);
  }
  return requirementResponse;
};

const download = async addr => {
  await checkClient();
  checkDataTransferDirectory();
  const downloadStream = fs.createWriteStream(downloadedFileName);
  let downloadResponse;
  try {
    downloadResponse = await transferClient.download({
      addr,
      downloadStream
    });
  } catch (ex) {
    return { statusCode: 500 };
  }
  return downloadResponse.statusCode === 200
    ? downloadResponse
    : await checkExpiredSession(downloadResponse, download, addr);
};

const upload = async uuid => {
  await checkClient();
  const uploadStream = fs.createReadStream(encryptedFileName);
  const stat = fs.statSync(encryptedFileName);
  const fileSize = stat.size;
  let uploadResponse;
  try {
    uploadResponse = await transferClient.upload({
      uploadStream,
      fileSize,
      uuid
    });
  } catch (ex) {
    return { statusCode: 500 };
  }
  return uploadResponse.statusCode === 200
    ? uploadResponse
    : await checkExpiredSession(uploadResponse, upload, uuid);
};

const encrypt = async () => {
  const { key, iv } = dbExporter.generateKeyAndIv();
  await dbExporter.encryptStreamFile({
    inputFile: exportedFileName,
    outputFile: encryptedFileName,
    key,
    iv
  });
  return { key, iv };
};

const decrypt = async key => {
  return await dbExporter.decryptStreamFile({
    inputFile: downloadedFileName,
    outputFile: decryptedFileName,
    key
  });
};

const importDatabase = async accountId => {
  return await dbExporter.importDatabaseFromFile({
    filepath: decryptedFileName,
    databasePath,
    accountId
  });
};

const exportDatabase = async () => {
  await checkClient();
  checkDataTransferDirectory();
  return await dbExporter.exportDatabaseToFile({
    databasePath,
    outputPath: exportedFileName
  });
};

const clearSyncData = () => {
  return removeDataTransferDirectoryRecursive();
};

module.exports = {
  download,
  upload,
  encrypt,
  decrypt,
  importDatabase,
  exportDatabase,
  clearSyncData
};
