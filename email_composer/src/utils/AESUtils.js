import CryptoJS from 'crypto-js';

export const generateKeyAndIv = (phrase, saltsize, keysize) => {
  const passphrase = phrase || CryptoJS.lib.WordArray.random(saltsize);
  const keySalt = CryptoJS.lib.WordArray.random(saltsize);
  const ivSalt = CryptoJS.lib.WordArray.random(saltsize);
  const keyParams = {
    keySize: keysize || 128 / 32,
    iterations: 1000
  };
  const keyArray = CryptoJS.PBKDF2(passphrase, keySalt, keyParams);
  const ivArray = CryptoJS.PBKDF2(passphrase, ivSalt, keyParams);
  return {
    key: keyArray.toString(CryptoJS.enc.Base64),
    iv: ivArray.toString(CryptoJS.enc.Base64)
  };
};

export const AesEncryptToBase64 = (data, keyArray, ivArray) => {
  const encrypted = CryptoJS.AES.encrypt(data, keyArray, { iv: ivArray });
  return encrypted.toString();
};

export const base64ToWordArray = base64String => {
  return CryptoJS.enc.Base64.parse(base64String);
};
