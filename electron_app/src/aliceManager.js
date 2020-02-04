const { spawn } = require('child_process');
const path = require('path');
const { app, dialog } = require('electron');
const dbManager = require('./database');
const portscanner = require('portscanner');
const http = require('http');
const ps = require('ps-node');
const globalManager = require('./globalManager');
const { encryptTextSimple } = require('./filescript/helpers');

const ALICE_PROJECT_NAME = 'criptext-encryption-service';

const getLogsPath = node_env => {
  switch (node_env) {
    case 'test': {
      return './src/__integrations__/alice_logs.txt';
    }
    case 'development': {
      return path
        .join(__dirname, '/alice_logs.txt')
        .replace('/app.asar', '')
        .replace('/src/database', '');
    }
    default: {
      const userDataPath = app.getPath('userData');
      return path
        .join(userDataPath, '/alice_logs.txt')
        .replace('/app.asar', '')
        .replace('/src/database', '');
    }
  }
};

const getAlicePath = nodeEnv => {
  switch (nodeEnv) {
    case 'development': {
      return path.join(
        __dirname,
        `../../signal_interface/build/Release/${ALICE_PROJECT_NAME}`
      );
    }
    default: {
      return path.join(
        path.dirname(__dirname),
        '../extraResources',
        ALICE_PROJECT_NAME
      );
    }
  }
};

const generatePassword = () => {
  return (
    Math.random()
      .toString(36)
      .slice(-8) +
    Math.random()
      .toString(36)
      .slice(-8) +
    Math.random()
      .toString(36)
      .slice(-8)
  );
};

let port = 8085;
let alertShown = false;
const password = generatePassword();
let alice = null;
let starting = false;
let aliceStartTimeout = null;

const passwordRegex = /^(PASSWORD:)/gm;
let token = undefined;

const getPort = () => {
  return port;
};

const getPassword = () => {
  return globalManager.databaseKey.get() || password;
};

const startAlice = async onAppOpened => {
  aliceStartTimeout = null;
  if (alice) return;
  if (starting) {
    await waitForAlice();
    return;
  }
  starting = true;
  const myPort = await portscanner.findAPortNotInUse(8085);
  port = myPort;
  const alicePath = getAlicePath(process.env.NODE_ENV);
  const dbpath = path.resolve(dbManager.databasePath);
  const logspath = path.resolve(getLogsPath(process.env.NODE_ENV));
  await cleanAliceRemenants();
  try {
    alice = await handShake({
      alicePath,
      dbpath,
      myPort,
      logspath,
      onAppOpened
    });
  } catch (ex) {
    if (!ex.retry) return;
    aliceStartTimeout = setTimeout(() => {
      startAlice(onAppOpened);
    }, 500);
  } finally {
    starting = false;
  }
};

const handShake = ({ alicePath, dbpath, myPort, logspath, onAppOpened }) => {
  return new Promise((resolve, reject) => {
    const alice = spawn(alicePath, [dbpath, myPort, logspath, '--no-sandbox']);
    alice.stderr.setEncoding('utf8');
    alice.stderr.on('data', data => {
      if (alertShown) {
        return;
      }
      alertShown = true;
      dialog.showErrorBox(
        'Service Error',
        `Unable to initialize encryption service. ${data}`
      );
      console.log(`-----alice-----\nError:\n${data}\n -----end-----`);
      if (onAppOpened) app.quit();
    });
    alice.stdout.setEncoding('utf8');
    alice.stdout.on('data', async data => {
      if (!passwordRegex.test(data)) {
        console.log(`-----alice-----\n${data}\n -----end-----`);
        return;
      }
      token = data.replace(passwordRegex, '').replace(/\r?\n|\r/g, '');
      const isReachable = await checkReachability();
      if (isReachable) {
        resolve(alice);
      } else {
        reject();
      }
    });
    alice.on('exit', (code, signal) => {
      console.log(`alice exited with code ${code} and signal ${signal}`);
      if (signal !== 'SIGTERM' && signal !== 'SIGABRT') {
        reject();
        return;
      }
      reject({ retry: true });
    });

    alice.on('close', code => {
      console.log(`alice closed with code ${code}`);
      reject();
    });
  });
};

const closeAlice = () => {
  if (alice) {
    alice.kill();
    alice = null;
  } else if (aliceStartTimeout) {
    clearTimeout(aliceStartTimeout);
    aliceStartTimeout = null;
  }
};

const restartAlice = async force => {
  if (alice) return;
  if (starting) {
    await waitForAlice();
  }
  const isReachable = await checkReachability();
  if (isReachable && !force) {
    return;
  }
  closeAlice();
  await startAlice();
  await checkReachability();
};

const waitForAlice = async () => {
  let retries = 10;
  while (starting && retries > 0) {
    await sleep();
    retries--;
  }
};

const isReachable = () => {
  const options = {
    hostname: 'localhost',
    port,
    path: '/password/set',
    method: 'POST',
    timeout: 500
  };
  return new Promise(async resolve => {
    if (!token) {
      resolve(false);
    }
    const req = http.request(options, res => {
      console.log(`statusCode: ${res.statusCode}`);
      resolve(res.statusCode === 200);
    });

    req.on('error', error => {
      console.log(error);
      resolve(false);
    });
    try {
      const data = await encryptTextSimple(getPassword(), token);
      req.write(JSON.stringify(data));
      req.end();
    } catch (ex) {
      console.log(ex);
    }
  });
};

const sleep = time => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

const checkReachability = async () => {
  let retries = 3;
  while (retries > 0) {
    const reachable = await isReachable();
    if (reachable) {
      return true;
    }
    retries--;
    await sleep(500);
  }
  return false;
};

const cleanAliceRemenants = () => {
  return new Promise(resolve => {
    ps.lookup({ command: ALICE_PROJECT_NAME }, async (err, list) => {
      if (err) {
        console.log(err);
        resolve();
        return;
      }
      console.log(list);
      await Promise.all(
        list.map(p => {
          return killPs(p.pid);
        })
      );
      resolve();
    });
  });
};

const killPs = id => {
  return new Promise(resolve => {
    ps.kill(id, { signal: 9 }, resolve);
  });
};

module.exports = {
  startAlice,
  restartAlice,
  closeAlice,
  getPassword,
  getPort,
  checkReachability,
  isReachable
};
