import FileManager from 'criptext-files-sdk';
import CryptoJS from 'crypto-js';
import base64js from 'base64-js';
import {
  FILE_SERVER_APP_ID,
  FILE_SERVER_KEY,
  getFileKeyByEmailId
} from './electronInterface';

const MAX_REQUESTS = 5;

export const fileManager = new FileManager(
  FILE_SERVER_APP_ID,
  FILE_SERVER_KEY,
  MAX_REQUESTS,
  false
);

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

export const setDownloadHandler = token => {
  fileManager.downloadFile(token, err => {
    return err;
  });
};

export const CHUNK_SIZE = 524288;

export const setCryptoInterfaces = async emailId => {
  const [fileKey] = await getFileKeyByEmailId(emailId);
  if (fileKey) {
    const { key, iv } = fileKey;
    fileManager.setCryptoInterfaces(null, (blob, callback) => {
      if (!key || !iv) {
        return callback(blob);
      }
      const keyArray = CryptoJS.enc.Base64.parse(key);
      const ivArray = CryptoJS.enc.Base64.parse(iv);
      const reader = new FileReader();
      reader.addEventListener('loadend', () => {
        const ciphertext = CryptoJS.lib.WordArray.create(reader.result);
        const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext });
        const decryptedWordArray = CryptoJS.AES.decrypt(
          cipherParams,
          keyArray,
          {
            iv: ivArray
          }
        );
        const decryptedBase64 = decryptedWordArray.toString(
          CryptoJS.enc.Base64
        );
        const decryptedArrayBuffer = base64js.toByteArray(decryptedBase64);
        callback(new Blob([new Uint8Array(decryptedArrayBuffer)]));
      });
      reader.readAsArrayBuffer(blob);
    });
  }
};
