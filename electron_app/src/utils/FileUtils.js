const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const { app } = require('electron');
const { removeLast } = require('./stringUtils');
const { APP_DOMAIN } = require('../utils/const');

const getUserEmailsPath = (node_env, user) => {
  switch (node_env) {
    case 'test': {
      const emailsPath = path.join('./src', '__integrations__', `${user}`);
      createPathRecursive(emailsPath);
      return emailsPath;
    }
    case 'development': {
      const emailsPath = path
        .join(__dirname, '/../userData', `${user}`, 'emails')
        .replace('/src', '');
      createPathRecursive(emailsPath);
      return emailsPath;
    }
    default: {
      const userDataPath = app.getPath('userData');
      const emailsPath = path.join(
        userDataPath,
        'userData',
        `${user}`,
        'emails'
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
  metadataKey,
  replaceKey
}) => {
  const myPath = await getUserEmailsPath(process.env.NODE_ENV, username);

  const emailPath = `${myPath}/${metadataKey}`;
  await createIfNotExist(emailPath);

  const bodyPath = `${emailPath}/body.txt`;
  await store(bodyPath, body);
  if (headers) {
    const headersPath = `${emailPath}/headers.txt`;
    await store(headersPath, headers);
  }
  if (replaceKey) {
    await remove(`${myPath}/${replaceKey}`).catch(console.error);
  }
};

const getEmailBody = async ({ username, metadataKey }) => {
  const myPath = await getUserEmailsPath(process.env.NODE_ENV, username);

  const emailPath = `${myPath}/${metadataKey}`;
  const bodyPath = `${emailPath}/body.txt`;
  try {
    const body = await retrieve(bodyPath);
    return body;
  } catch (ex) {
    return undefined;
  }
};

const getEmailHeaders = async ({ username, metadataKey }) => {
  const myPath = await getUserEmailsPath(process.env.NODE_ENV, username);
  const emailPath = `${myPath}/${metadataKey}`;
  const headersPath = `${emailPath}/headers.txt`;
  try {
    const body = await retrieve(headersPath);
    return body;
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
        fs.renameSync(lastPath, curDir);
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
  removeUserDir,
  getUserEmailsPath,
  createIfNotExist,
  checkIfExists
};
