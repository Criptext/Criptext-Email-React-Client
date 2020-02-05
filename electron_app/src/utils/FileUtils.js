const fs = require('fs');
const copy = require('recursive-copy');
const rmdirRecursive = require('rmdir-recursive');
const path = require('path');
const rimraf = require('rimraf');
const { encryptText, decryptText } = require('../filescript/helpers');
const { app } = require('electron');
const { removeLast } = require('./stringUtils');
const { APP_DOMAIN } = require('./const');

const getUserEmailsPath = (node_env, user, isCopy) => {
  switch (node_env) {
    case 'test': {
      const emailsPath = path.join(
        './src',
        '__integrations__',
        `${user}`,
        isCopy ? 'emails-copy' : 'emails'
      );
      createPathRecursive(emailsPath);
      return emailsPath;
    }
    case 'development': {
      const emailsPath = path
        .join(
          __dirname,
          '/../userData',
          `${user}`,
          isCopy ? 'emails-copy' : 'emails'
        )
        .replace('/src', '');
      const userToReplace = `${user}@${APP_DOMAIN}`;
      createPathRecursive(emailsPath, userToReplace, user);
      return emailsPath;
    }
    default: {
      const userDataPath = app.getPath('userData');
      const emailsPath = path.join(
        userDataPath,
        'userData',
        `${user}`,
        isCopy ? 'emails-copy' : 'emails'
      );
      const userToReplace = `${user}@${APP_DOMAIN}`;
      createPathRecursive(emailsPath, userToReplace, user);
      return emailsPath;
    }
  }
};

const saveEmailBody = async ({
  body,
  headers,
  username,
  password,
  metadataKey,
  replaceKey,
  isCopy
}) => {
  const myPath = await getUserEmailsPath(
    process.env.NODE_ENV,
    username,
    isCopy
  );
  const emailPath = `${myPath}/${metadataKey}`;
  await createIfNotExist(emailPath);

  if (body) {
    const bodyPath = `${emailPath}/body.txt`;
    const bodyToStore = !password
      ? body
      : await encryptText({ text: body, password });
    await store(bodyPath, bodyToStore);
  }

  if (headers) {
    const headersPath = `${emailPath}/headers.txt`;
    const headersToStore = !password
      ? headers
      : await encryptText({ text: headers, password });
    await store(headersPath, headersToStore);
  }
  if (replaceKey) {
    await remove(`${myPath}/${replaceKey}`).catch(console.error);
  }
};

const getEmailBody = async ({ username, metadataKey, password }) => {
  const myPath = await getUserEmailsPath(process.env.NODE_ENV, username);

  const emailPath = `${myPath}/${metadataKey}`;
  const bodyPath = `${emailPath}/body.txt`;
  try {
    if (password) {
      const data = await retrieveBuffer(bodyPath);
      const body = decryptText({ data, password });
      return body;
    }
    const body = await retrieve(bodyPath);
    return body;
  } catch (ex) {
    return undefined;
  }
};

const getEmailHeaders = async ({ username, metadataKey, password }) => {
  const myPath = await getUserEmailsPath(process.env.NODE_ENV, username);
  const emailPath = `${myPath}/${metadataKey}`;
  const headersPath = `${emailPath}/headers.txt`;
  try {
    if (password) {
      const data = await retrieveBuffer(headersPath);
      const headers = decryptText({ data, password });
      return headers;
    }
    const headers = await retrieve(headersPath);
    return headers;
  } catch (ex) {
    return undefined;
  }
};

const deleteEmailContent = async ({ metadataKey, username }) => {
  const myPath = await getUserEmailsPath(process.env.NODE_ENV, username);
  const emailPath = `${myPath}/${metadataKey}`;
  await remove(emailPath).catch(console.error);
};

const removeUserDir = async username => {
  const emailsPath = await getUserEmailsPath(process.env.NODE_ENV, username);
  const userPath = removeLast(emailsPath, '/emails');
  await remove(userPath);
};

const replaceEmailsWithCopy = async username => {
  const emailsPath = await getUserEmailsPath(process.env.NODE_ENV, username);
  const emailsCopyPath = await getUserEmailsPath(
    process.env.NODE_ENV,
    username,
    true
  );
  await remove(emailsPath);
  fs.renameSync(emailsCopyPath, emailsPath);
};

const removeEmailsCopy = async username => {
  const emailsCopyPath = await getUserEmailsPath(
    process.env.NODE_ENV,
    username,
    true
  );
  await remove(emailsCopyPath);
};

const store = (path, text) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, text, err => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
};

const retrieve = path => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, { encoding: 'utf-8' }, (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve(data);
    });
  });
};

const retrieveBuffer = path => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve(data);
    });
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

const createIfNotExist = path => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(path)) return resolve();
    fs.mkdir(path, err => {
      if (err) return reject(err);
      resolve();
    });
  });
};

const checkIfExists = path => {
  try {
    return fs.existsSync(path);
  } catch (e) {
    return false;
  }
};

const createPathRecursive = (fullpath, oldUser, newUser) => {
  const sep = path.sep;
  const initDir = path.isAbsolute(fullpath) ? sep : '';
  fullpath.split(sep).reduce((parentDir, childDir) => {
    let curDir = path.resolve(parentDir, childDir);

    if (childDir === newUser) {
      const lastPath = path.resolve(parentDir, oldUser);
      if (fs.existsSync(lastPath)) {
        curDir = path.resolve(parentDir, newUser);
        try {
          fs.renameSync(lastPath, curDir);
        } catch (err) {
          const source = path.resolve(parentDir, `${oldUser}/emails/`);
          const dest = path.resolve(parentDir, `${newUser}/emails/`);
          copy(source, dest, { overwrite: true }).then(function() {
            const folder = path.resolve(parentDir, `${oldUser}`);
            rmdirRecursive(folder);
          });
        }
        return curDir;
      }
    }

    if (!fs.existsSync(curDir)) {
      fs.mkdirSync(curDir);
    }
    return curDir;
  }, initDir);
};

module.exports = {
  saveEmailBody,
  getEmailBody,
  getEmailHeaders,
  deleteEmailContent,
  remove,
  removeEmailsCopy,
  removeUserDir,
  replaceEmailsWithCopy,
  getUserEmailsPath,
  createIfNotExist,
  checkIfExists,
  createPathRecursive,
  store,
  retrieve: retrieveBuffer
};
