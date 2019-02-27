/* eslint-env node, jest */

import CryptoJS from 'crypto-js';
import {
  AesEncrypt,
  AesDecrypt,
  generateKeyAndIv,
  encryptDummySession,
  decryptDummySession,
  generateKey
} from './../AESUtils';

const dummySessionObject = {
  fileKey: 'customKey:customIv',
  fileKeys: ['customKey:customIv', 'customKey:customIv'],
  identityKey: {
    publicKey: 'base64(identityKey.pubKey)',
    privateKey: 'base64(identityKey.privKey)'
  },
  registrationId: 1,
  preKey: {
    keyId: 1,
    publicKey: 'base64(preKey.keyPair.pubKey)',
    privateKey: 'base64(preKey.keyPair.privKey)'
  },
  signedPreKey: {
    keyId: 1,
    publicKey: 'base64(signedPreKey.keyPair.pubKey)',
    privateKey: 'base64(signedPreKey.keyPair.privKey)'
  }
};

describe('AES Utils: ', () => {
  it('Should correctly encrypt and decrypt a word array', () => {
    const initialWA = CryptoJS.lib.WordArray.random(8);
    const keyWA = CryptoJS.lib.WordArray.random(4);
    const ivWA = CryptoJS.lib.WordArray.random(4);
    const encryptedB64 = AesEncrypt(initialWA, keyWA, ivWA);
    const decryptedWA = AesDecrypt(encryptedB64, keyWA, ivWA);
    expect(decryptedWA.toString()).toBe(initialWA.toString());
  });

  it('Should correctly encrypt and decrypt session', () => {
    const passphrase = '123456';
    const { key, iv, salt } = generateKeyAndIv(passphrase);
    // Encrypt
    const dummyString = JSON.stringify(dummySessionObject);
    const encryptedDummySessionB64 = encryptDummySession({
      dummyString,
      saltB64: salt,
      keyB64: key,
      IvB64: iv
    });
    // Decrypt
    const decryptedString = decryptDummySession({
      encryptedDummySessionB64,
      passphrase
    });
    const resultObject = JSON.parse(decryptedString);
    expect(resultObject).toMatchObject(
      expect.objectContaining({
        fileKey: dummySessionObject.fileKey,
        fileKeys: dummySessionObject.fileKeys,
        registrationId: dummySessionObject.registrationId,
        preKey: {
          keyId: dummySessionObject.preKey.keyId,
          publicKey: dummySessionObject.preKey.publicKey,
          privateKey: dummySessionObject.preKey.privateKey
        },
        signedPreKey: {
          keyId: dummySessionObject.signedPreKey.keyId,
          publicKey: dummySessionObject.signedPreKey.publicKey,
          privateKey: dummySessionObject.signedPreKey.privateKey
        }
      })
    );
  });

  it('Should correctly generate key', () => {
    const passphrase = '7h1s1sMyp4$$phr4s3';
    const saltWA = CryptoJS.lib.WordArray.random(8);
    const expectedKey = generateKey(passphrase, saltWA).key;
    const keyWithSameParams = generateKey(passphrase, saltWA).key;
    expect(keyWithSameParams).toBe(expectedKey);
  });
});
