import CryptoJS from 'crypto-js';

const saltSize = 8;
const ivSize = 16;

/*   Dummy Session
---------------------*/
export const encryptDummySession = ({
  dummyString,
  saltB64,
  keyB64,
  IvB64
}) => {
  const saltWArray = base64ToWordArray(saltB64);
  const ivWArray = base64ToWordArray(IvB64);
  const keyWArray = base64ToWordArray(keyB64);
  const encryptedSessionB64 = AesEncrypt(dummyString, keyWArray, ivWArray);
  const encryptedSessionWArray = base64ToWordArray(encryptedSessionB64);
  const saltBArray = wordArrayToByteArray(saltWArray);
  const ivBArray = wordArrayToByteArray(ivWArray);
  const encryptedSessionBArray = wordArrayToByteArray(encryptedSessionWArray);
  const sessionByteArray = saltBArray.concat(
    ivBArray.concat(encryptedSessionBArray)
  );
  const sessionWordArray = byteArrayToWordArray(sessionByteArray);
  return wordArrayToBase64(sessionWordArray);
};

export const decryptDummySession = ({
  encryptedDummySessionB64,
  passphrase
}) => {
  const encryptedDummySessionWA = base64ToWordArray(encryptedDummySessionB64);
  const encryptedDummySessionBA = wordArrayToByteArray(encryptedDummySessionWA);

  const saltBA = encryptedDummySessionBA.slice(0, 8);
  const ivBA = encryptedDummySessionBA.slice(8, 24);
  const sessionBA = encryptedDummySessionBA.slice(
    24,
    encryptedDummySessionBA.length
  );

  const saltWA = byteArrayToWordArray(saltBA);
  const ivWA = byteArrayToWordArray(ivBA);
  const sessionWA = byteArrayToWordArray(sessionBA);

  const sessionB64 = wordArrayToBase64(sessionWA);
  const keyGenerated = generateKey(passphrase, saltWA);
  const keyGeneratedWA = base64ToWordArray(keyGenerated.key);
  const decrypted = AesDecrypt(sessionB64, keyGeneratedWA, ivWA);
  return decrypted.toString(CryptoJS.enc.Utf8);
};

/*   AES
---------------------*/
export const AesEncrypt = (data, keyArray, ivArray) => {
  const encrypted = CryptoJS.AES.encrypt(data, keyArray, { iv: ivArray });
  return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
};

export const AesDecrypt = (encryptedDataB64, keyArray, ivArray) => {
  const cipherParams = CryptoJS.lib.CipherParams.create({
    ciphertext: CryptoJS.enc.Base64.parse(encryptedDataB64)
  });
  return CryptoJS.AES.decrypt(cipherParams, keyArray, {
    iv: ivArray
  });
};

/*   Key
---------------------*/
export const generateKey = (phrase, optionalSaltArray) => {
  const passphrase = phrase || CryptoJS.lib.WordArray.random(saltSize);
  const salt = optionalSaltArray || CryptoJS.lib.WordArray.random(saltSize);
  const keyParams = {
    hasher: CryptoJS.algo.SHA256,
    iterations: 10000,
    keySize: 128 / 32
  };
  const keyArray = CryptoJS.PBKDF2(passphrase, salt, keyParams);
  return {
    key: keyArray.toString(CryptoJS.enc.Base64),
    salt: salt.toString(CryptoJS.enc.Base64)
  };
};

export const generateKeyAndIv = (
  phrase,
  optionalSaltArray,
  optionalIvArray
) => {
  const { key, salt } = generateKey(phrase, optionalSaltArray);
  const ivArray = optionalIvArray || CryptoJS.lib.WordArray.random(ivSize);
  return {
    salt,
    key,
    iv: ivArray.toString(CryptoJS.enc.Base64)
  };
};

/*   Utils
---------------------*/
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
