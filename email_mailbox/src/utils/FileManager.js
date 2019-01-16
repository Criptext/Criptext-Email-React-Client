import FileManager from 'criptext-files-sdk';
import CryptoJS from 'crypto-js';
import base64js from 'base64-js';
import { myAccount } from './electronInterface';
import { openFileExplorer, getFileKeyByEmailId } from './ipc';

const MAX_REQUESTS = 5;

export const fileManager = new FileManager({
  auth: 'Bearer',
  auth_token: myAccount.jwt,
  max_requests: MAX_REQUESTS,
  sandbox: false
});

export const { FILE_PROGRESS, FILE_FINISH, FILE_ERROR } = fileManager.Event;

export const setCancelDownloadHandler = token => {
  fileManager.cancelDownload(token, err => {
    return err;
  });
};

export const setFileProgressHandler = progressHandler => {
  fileManager.on(FILE_PROGRESS, progressHandler);
};

export const setFileSuccessHandler = successHandler => {
  fileManager.on(FILE_FINISH, successHandler);
};

export const setFileErrorHandler = errorHandler => {
  fileManager.on(FILE_ERROR, errorHandler);
};

export const setDownloadHandler = (token, filename) => {
  if (filename) {
    openFileExplorer(filename);
    return;
  }
  fileManager.downloadFile(token, err => {
    return err;
  });
};

export const CHUNK_SIZE = 524288;

export const setCryptoInterfaces = async (key, iv) => {
  fileManager.setCryptoInterfaces(null, (filetoken, blob, callback) => {
    if (!key || !iv) {
      return callback(blob);
    }
    const keyArray = CryptoJS.enc.Base64.parse(key);
    const ivArray = CryptoJS.enc.Base64.parse(iv);
    const reader = new FileReader();
    reader.addEventListener('loadend', () => {
      const ciphertext = CryptoJS.lib.WordArray.create(reader.result);
      const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext });
      const decryptedWordArray = CryptoJS.AES.decrypt(cipherParams, keyArray, {
        iv: ivArray
      });
      const decryptedBase64 = decryptedWordArray.toString(CryptoJS.enc.Base64);
      const decryptedArrayBuffer = base64js.toByteArray(decryptedBase64);
      callback(new Blob([new Uint8Array(decryptedArrayBuffer)]));
    });
    reader.readAsArrayBuffer(blob);
  });
};
