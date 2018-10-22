import FileManager from 'criptext-files-sdk';
import CryptoJS from 'crypto-js';
import base64js from 'base64-js';
import { myAccount } from './electronInterface';

const MAX_REQUESTS = 5;

export const fileManager = new FileManager({
  auth: 'Bearer',
  auth_token: myAccount.jwt,
  max_requests: MAX_REQUESTS,
  sandbox: false
});

export const { FILE_PROGRESS, FILE_FINISH, FILE_ERROR } = fileManager.Event;

export const CHUNK_SIZE = 524288;

export const FILE_MODES = {
  UPLOADING: 'uploading',
  FAILED: 'failed',
  PAUSED: 'paused',
  UPLOADED: 'uploaded'
};

export const FILE_TYPES = {
  IMAGE: 'image',
  AUDIO: 'audio',
  VIDEO: 'video',
  PDF: 'pdf',
  OFFICE_DOC: 'word',
  OFFICE_SHEET: 'excel',
  OFFICE_PPT: 'ppt',
  ZIP: 'zip',
  DEFAULT: 'file-default'
};

const officeDocTypes = [
  'msword',
  'vnd.openxmlformats-officedocument.wordprocessingml.document',
  'vnd.openxmlformats-officedocument.wordprocessingml.template',
  'vnd.ms-word.document.macroEnabled.12',
  'vnd.ms-word.template.macroEnabled.12'
];

const officeSheetTypes = [
  'vnd.ms-excel',
  'vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'vnd.openxmlformats-officedocument.spreadsheetml.template',
  'vnd.ms-excel.sheet.macroEnabled.12',
  'vnd.ms-excel.template.macroEnabled.12',
  'vnd.ms-excel.addin.macroEnabled.12',
  'vnd.ms-excel.sheet.binary.macroEnabled.12'
];

const officePptTypes = [
  'vnd.ms-powerpoint',
  'vnd.openxmlformats-officedocument.presentationml.presentation',
  'vnd.openxmlformats-officedocument.presentationml.template',
  'vnd.openxmlformats-officedocument.presentationml.slideshow',
  'vnd.ms-powerpoint.addin.macroEnabled.12',
  'vnd.ms-powerpoint.presentation.macroEnabled.12',
  'vnd.ms-powerpoint.template.macroEnabled.12',
  'vnd.ms-powerpoint.slideshow.macroEnabled.12'
];

export const identifyFileType = mimetype => {
  const [type, subtype] = mimetype.split('/');

  switch (type) {
    case 'image':
      return FILE_TYPES.IMAGE;
    case 'audio':
      return FILE_TYPES.AUDIO;
    case 'video':
      return FILE_TYPES.VIDEO;
    case 'text': {
      if (subtype === 'csv') return FILE_TYPES.OFFICE_SHEET;
      return FILE_TYPES.DEFAULT;
    }
    case 'application': {
      if (subtype === 'pdf') return FILE_TYPES.PDF;
      if (subtype === 'zip') return FILE_TYPES.ZIP;
      if (officeDocTypes.indexOf(subtype) > -1) return FILE_TYPES.OFFICE_DOC;
      if (officeSheetTypes.indexOf(subtype) > -1)
        return FILE_TYPES.OFFICE_SHEET;
      if (officePptTypes.indexOf(subtype) > -1) return FILE_TYPES.OFFICE_PPT;
      return FILE_TYPES.DEFAULT;
    }
    default:
      return FILE_TYPES.DEFAULT;
  }
};

export const formFileParamsToDatabase = (files, emailId) => {
  return files.map(item => {
    return {
      token: item.token,
      name: item.fileData.name,
      size: item.fileData.size,
      status: 1,
      date: Date.now(),
      mimeType: item.fileData.type,
      emailId
    };
  });
};

export const getFileParamsToSend = files => {
  if (!files.length) return undefined;
  return files.map(file => ({
    token: file.token,
    name: file.fileData.name,
    size: file.fileData.size,
    mimeType: file.fileData.type
  }));
};

export const setCryptoInterfaces = (keyBase64, ivBase64) => {
  fileManager.setCryptoInterfaces((blob, callback) => {
    if (!keyBase64 || !ivBase64) {
      return callback(blob);
    }
    const reader = new FileReader();
    reader.addEventListener('loadend', () => {
      const keyWordArray = CryptoJS.enc.Base64.parse(keyBase64);
      const ivWordArray = CryptoJS.enc.Base64.parse(ivBase64);
      const content = CryptoJS.lib.WordArray.create(reader.result);
      const encryptedWordArray = CryptoJS.AES.encrypt(content, keyWordArray, {
        iv: ivWordArray
      });
      const encryptedBase64 = encryptedWordArray.toString();
      const encryptedArrayBuffer = base64js.toByteArray(encryptedBase64);
      callback(new Blob([new Uint8Array(encryptedArrayBuffer)]));
    });
    reader.readAsArrayBuffer(blob);
  }, null);
};

export const defineTypeSource = mimetype => {
  const [type, subtype] = mimetype.split('/');
  switch (type) {
    case 'image':
      return 'fileimage';
    case 'audio':
      return 'fileaudio';
    case 'video':
      return 'filevideo';
    case 'text': {
      if (subtype === 'csv') return 'fileexcel';
      return 'filedefault';
    }
    case 'application': {
      if (subtype === 'pdf') return 'filepdf';
      if (subtype === 'zip') return 'filezip';
      if (officeDocTypes.indexOf(subtype) > -1) return 'fileword';
      if (officeSheetTypes.indexOf(subtype) > -1) return 'fileexcel';
      if (officePptTypes.indexOf(subtype) > -1) return 'fileppt';
      return 'filedefault';
    }
    default:
      return 'filedefault';
  }
};
