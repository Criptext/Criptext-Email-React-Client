const fs = require('fs');
const crypto = require('crypto');
const zlib = require('zlib');

const CIPHER_ALGORITHM = 'aes-128-cbc';
const STREAM_SIZE = 512 * 1024;
const DEFAULT_KEY_LENGTH = 16;

const zipStreamFile = ({ inputFile, outputFile }) => {
  return new Promise((resolve, reject) => {
    const highWaterMark = STREAM_SIZE;
    const reader = fs.createReadStream(inputFile, { highWaterMark });
    const writer = fs.createWriteStream(outputFile);
    reader
      .pipe(zlib.createGzip())
      .pipe(writer)
      .on('error', reject)
      .on('finish', resolve);
  });
};

const encryptStreamFile = ({ inputFile, outputFile, key, iv, salt }) => {
  return new Promise((resolve, reject) => {
    const reader = fs.createReadStream(inputFile, {
      highWaterMark: STREAM_SIZE
    });
    const writer = fs.createWriteStream(outputFile);
    if (salt) writer.write(salt);
    writer.write(iv);

    reader
      .pipe(zlib.createGzip())
      .pipe(crypto.createCipheriv(CIPHER_ALGORITHM, key, iv))
      .pipe(writer)
      .on('error', reject)
      .on('finish', resolve);
  });
};

const generateKeyAndIvFromPassword = (password, customSalt) => {
  const salt = customSalt || crypto.randomBytes(8);
  const iterations = 10000;
  const pbkdf2Name = 'sha256';
  const key = crypto.pbkdf2Sync(
    Buffer.from(password, 'utf8'),
    salt,
    iterations,
    DEFAULT_KEY_LENGTH,
    pbkdf2Name
  );
  const iv = crypto.randomBytes(DEFAULT_KEY_LENGTH);
  return { key, iv, salt };
};

module.exports = {
  zipStreamFile,
  generateKeyAndIvFromPassword,
  encryptStreamFile
};
