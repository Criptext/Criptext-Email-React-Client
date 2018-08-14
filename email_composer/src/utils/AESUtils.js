import CryptoJS from 'crypto-js';

export const generateKeyAndIv = (phrase, saltsize) => {
  const passphrase = phrase || CryptoJS.lib.WordArray.random(saltsize);
  const salt = CryptoJS.lib.WordArray.random(saltsize);
  const keyParams = {
    keySize: 128 / 32,
    iterations: 10000,
    hasher: CryptoJS.algo.SHA256
  };
  const keyArray = CryptoJS.PBKDF2(passphrase, salt, keyParams);
  const ivArray = CryptoJS.lib.WordArray.random(16);
  return {
    key: keyArray.toString(CryptoJS.enc.Base64),
    iv: ivArray.toString(CryptoJS.enc.Base64),
    salt: salt.toString(CryptoJS.enc.Base64)
  };
};

export const AesEncrypt = (data, keyArray, ivArray) => {
  const encrypted = CryptoJS.AES.encrypt(data, keyArray, { iv: ivArray });
  const based64 = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
  return base64ToWordArray(based64);
};

export const base64ToWordArray = base64String => {
  return CryptoJS.enc.Base64.parse(base64String);
};

export const wordArrayToBase64 = wordArray => {
  return CryptoJS.enc.Base64.stringify(wordArray);
};

export const byteArrayToWordArray = bytearray => {
  const wa = [];
  let i;
  for (i = 0; i < bytearray.length; i++) {
    wa[(i / 4) | 0] |= bytearray[i] << (24 - 8 * i);
  }
  return CryptoJS.lib.WordArray.create(wa, bytearray.length);
};

const wordToByteArray = (word, length) => {
  const ba = [];
  const xFF = 0xff;
  if (length > 0) ba.push(word >>> 24);
  if (length > 1) ba.push((word >>> 16) & xFF);
  if (length > 2) ba.push((word >>> 8) & xFF);
  if (length > 3) ba.push(word & xFF);
  return ba;
};

export const wordArrayToByteArray = (wordarray, length) => {
  if (
    wordarray.hasOwnProperty('sigBytes') &&
    wordarray.hasOwnProperty('words')
  ) {
    length = wordarray.sigBytes;
    wordarray = wordarray.words;
  }
  const result = [];
  let i = 0;
  let bytes;
  while (length > 0) {
    bytes = wordToByteArray(wordarray[i], Math.min(4, length));
    length -= bytes.length;
    result.push(bytes);
    i++;
  }
  return [].concat.apply([], result);
};
