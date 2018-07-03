import FileManager from 'criptext-files-sdk';
import { FILE_SERVER_APP_ID, FILE_SERVER_KEY } from './electronInterface';

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
