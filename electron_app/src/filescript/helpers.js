const rimraf = require('rimraf');
const crypto = require('crypto');
const fs = require('fs');

const CIPHER_ALGORITHM = 'aes-128-cbc';
const STREAM_SIZE = 512 * 1024;
const DEFAULT_SALT_LENGTH = 8;
const DEFAULT_IV_LENGTH = 16;

const fileStat = path => {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stat) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(stat);
    });
  });
};

const readDir = path => {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(files);
    });
  });
};

const copyFile = (inPath, outPath) => {
  return new Promise((resolve, reject) => {
    fs.copyFile(inPath, outPath, err => {
      if (err) reject();
      resolve();
    });
  });
};

const readBytesSync = (filePath, filePosition, bytesToRead) => {
  const buf = Buffer.alloc(bytesToRead, 0);
  let fd;
  try {
    fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buf, 0, bytesToRead, filePosition);
  } finally {
    if (fd) {
      fs.closeSync(fd);
    }
  }
  return buf;
};

const generateKeyAndIvFromPassword = (password, customSalt) => {
  const salt = customSalt || crypto.randomBytes(8);
  const iterations = 10000;
  const pbkdf2Name = 'sha256';
  const key = crypto.pbkdf2Sync(
    Buffer.from(password, 'utf8'),
    salt,
    iterations,
    DEFAULT_IV_LENGTH,
    pbkdf2Name
  );
  const iv = crypto.randomBytes(DEFAULT_IV_LENGTH);
  return { key, iv, salt };
};

const decryptEncryptStreamFile = ({
  inputFile,
  outputFile,
  password,
  oldPassword
}) => {
  return new Promise((resolve, reject) => {
    const fileSalt = readBytesSync(inputFile, 0, DEFAULT_SALT_LENGTH);
    const fileIv = readBytesSync(
      inputFile,
      DEFAULT_SALT_LENGTH,
      DEFAULT_IV_LENGTH
    );
    if (!fileSalt || !fileIv) {
      return resolve();
    }

    const result = generateKeyAndIvFromPassword(oldPassword, fileSalt);
    const oldFileKey = result.key;
    const { key } = generateKeyAndIvFromPassword(password, fileSalt);
    const fileKey = key;
    const reader = fs.createReadStream(inputFile, {
      start: DEFAULT_SALT_LENGTH + DEFAULT_IV_LENGTH,
      highWaterMark: STREAM_SIZE
    });

    const writer = fs.createWriteStream(outputFile);
    writer.write(fileSalt);
    writer.write(fileIv);

    reader
      .pipe(crypto.createDecipheriv(CIPHER_ALGORITHM, oldFileKey, fileIv))
      .on('error', async () => {
        await copyFile(inputFile, outputFile);
        resolve();
      })
      .pipe(crypto.createCipheriv(CIPHER_ALGORITHM, fileKey, fileIv))
      .on('error', reject)
      .pipe(writer)
      .on('error', reject)
      .on('finish', resolve);
  });
};

const encryptStreamFile = ({ inputFile, outputFile, password }) => {
  return new Promise((resolve, reject) => {
    const { key, salt, iv } = generateKeyAndIvFromPassword(password);

    const reader = fs.createReadStream(inputFile, {
      highWaterMark: STREAM_SIZE
    });

    const writer = fs.createWriteStream(outputFile);
    writer.write(salt);
    writer.write(iv);

    reader
      .pipe(crypto.createCipheriv(CIPHER_ALGORITHM, key, iv))
      .pipe(writer)
      .on('error', reject)
      .on('finish', resolve);
  });
};

const decryptStreamFile = ({ inputFile, outputFile, password }) => {
  return new Promise((resolve, reject) => {
    const fileSalt = readBytesSync(inputFile, 0, DEFAULT_SALT_LENGTH);
    const fileIv = readBytesSync(
      inputFile,
      DEFAULT_SALT_LENGTH,
      DEFAULT_IV_LENGTH
    );

    const result = generateKeyAndIvFromPassword(password, fileSalt);
    const oldFileKey = result.key;

    const reader = fs.createReadStream(inputFile, {
      start: DEFAULT_SALT_LENGTH + DEFAULT_IV_LENGTH,
      highWaterMark: STREAM_SIZE
    });

    const writer = fs.createWriteStream(outputFile);
    reader
      .pipe(crypto.createDecipheriv(CIPHER_ALGORITHM, oldFileKey, fileIv))
      .pipe(writer)
      .on('error', reject)
      .on('finish', resolve);
  });
};

const encryptText = ({ text, password }) => {
  return new Promise((resolve, reject) => {
    try {
      const { key, salt, iv } = generateKeyAndIvFromPassword(password);
      const cipher = crypto.createCipheriv(CIPHER_ALGORITHM, key, iv);
      const data = Buffer.concat([
        salt,
        iv,
        cipher.update(text),
        cipher.final()
      ]);
      resolve(data);
    } catch (ex) {
      reject(text);
    }
  });
};

const decryptText = ({ data, password }) => {
  return new Promise(resolve => {
    try {
      const fileSalt = Buffer.from(data).slice(0, DEFAULT_SALT_LENGTH);
      const fileIv = Buffer.from(data).slice(
        DEFAULT_SALT_LENGTH,
        DEFAULT_SALT_LENGTH + DEFAULT_IV_LENGTH
      );
      const result = generateKeyAndIvFromPassword(password, fileSalt);
      const key = result.key;

      const encryptedText = Buffer.from(data).slice(
        DEFAULT_SALT_LENGTH + DEFAULT_IV_LENGTH
      );
      const cipher = crypto.createDecipheriv(CIPHER_ALGORITHM, key, fileIv);
      const buffer = Buffer.concat([
        cipher.update(encryptedText),
        cipher.final()
      ]);

      resolve(buffer.toString());
    } catch (ex) {
      resolve(data.toString());
    }
  });
};

const remove = path => {
  return new Promise((resolve, reject) => {
    rimraf(path, err => {
      if (err) return reject(err);
      resolve();
    });
  });
};

const sendMessage = message => {
  if (!process.send) {
    return;
  }
  process.send({ message });
};

module.exports = {
  fileStat,
  readDir,
  readBytesSync,
  generateKeyAndIvFromPassword,
  decryptEncryptStreamFile,
  encryptStreamFile,
  decryptStreamFile,
  encryptText,
  decryptText,
  remove,
  sendMessage
};
