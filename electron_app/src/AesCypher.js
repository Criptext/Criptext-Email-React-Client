const CryptoJS = require('crypto-js');

const encrypt = (data, key, iv) => {
  return CryptoJS.AES.encrypt(data, key, { iv });
};

const generateKey = (password, salt) => {
  const saltArray = CryptoJS.enc.Base64.stringify(salt);
  const keyParams = {
    keySize: 128 / 32,
    iterations: 10000,
    hasher: CryptoJS.algo.SHA256
  };
  return CryptoJS.PBKDF2(password, saltArray, keyParams);
};

const generateRandomBytes = length => {
  const bytesLength = length || 16;
  return CryptoJS.lib.WordArray.random(bytesLength);
};

class AesCypherManager {
  constructor() {
    this.encrypt = encrypt;
    this.generateKey = generateKey;
    this.generateRandomBytes = generateRandomBytes;
  }
}

module.exports = new AesCypherManager();
