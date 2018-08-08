import CryptoJS from 'crypto-js';

export const hashPassword = password => {
  const strngToHash = password;
  return CryptoJS.SHA256(strngToHash).toString(CryptoJS.enc.Base64);
};
