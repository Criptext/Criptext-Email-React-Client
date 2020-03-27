import FileManager from 'criptext-files-sdk';
import CryptoJS from 'crypto-js';
import base64js from 'base64-js';
import { myAccount } from './electronInterface';
import { checkExpiredSession } from './ipc';

const MAX_REQUESTS = 5;
const EXPIRED_SESSION_STATUS = 401;

let fileKeyIvs = {};
const clientsMap = new Map();

const createClient = () => {
  const recipientId = myAccount.recipientId;
  const client = clientsMap[recipientId];
  if (client) return client;
  const newClient = new FileManager({
    auth: 'Bearer',
    auth_token: myAccount.jwt,
    max_requests: MAX_REQUESTS,
    sandbox: false
  });
  clientsMap[recipientId] = newClient;
  return newClient;
};

export const setCancelDownloadHandler = token => {
  const fileManager = createClient();
  fileManager.cancelDownload(token, err => {
    return err;
  });
};

export const setFileProgressHandler = progressHandler => {
  const fileManager = createClient();
  fileManager.on(fileManager.Event.FILE_PROGRESS, progressHandler);
};

export const setFileSuccessHandler = successHandler => {
  const fileManager = createClient();
  fileManager.on(fileManager.Event.FILE_FINISH, successHandler);
};

export const setFileErrorHandler = errorHandler => {
  const fileManager = createClient();
  fileManager.on(fileManager.Event.FILE_ERROR, errorHandler);
};

export const setDownloadHandler = token => {
  const fileManager = createClient();
  fileManager.downloadFile(token, async error => {
    if (error) {
      const { status } = error;
      if (status === EXPIRED_SESSION_STATUS) {
        return await checkExpiredSession({
          response: { status },
          initialRequest: setDownloadHandler,
          requestParams: token
        });
      }
      return error;
    }
  });
};

export const CHUNK_SIZE = 524288;

export const setCryptoInterfaces = (ftoken, key, iv) => {
  const fileManager = createClient();
  fileKeyIvs[ftoken] = { key, iv };
  fileManager.setCryptoInterfaces(null, (filetoken, blob, callback) => {
    const { key, iv } = fileKeyIvs[filetoken];
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

export const clearKeys = () => {
  fileKeyIvs = {};
};
