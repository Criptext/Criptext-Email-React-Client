const { spawn } = require('child_process');
const path = require('path');
const { app, dialog } = require('electron');
const dbManager = require('./database');
const portscanner = require('portscanner');
const http = require('http');
const ps = require('ps-node');

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
let aliceStartTimeout = null;

const getPort = () => {
  return port;
};

const getPassword = () => {
  return password;
};

const startAlice = async onAppOpened => {
  aliceStartTimeout = null;
  if (!alice) {
    const myPort = await portscanner.findAPortNotInUse(8085);
    port = myPort;

    const alicePath = getAlicePath(process.env.NODE_ENV);
    const dbpath = path.resolve(dbManager.databasePath);
    const logspath = path.resolve(getLogsPath(process.env.NODE_ENV));
    await cleanAliceRemenants();
    alice = spawn(alicePath, [
      dbpath,
      myPort,
      logspath,
      password,
      '--no-sandbox'
    ]);
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
    alice.stdout.on('data', data => {
      console.log(`-----alice-----\n${data}\n -----end-----`);
    });
    alice.on('exit', (code, signal) => {
      console.log(`alice exited with code ${code} and signal ${signal}`);
      alice = null;
      if (signal !== 'SIGTERM' && signal !== 'SIGABRT') {
        return;
      }
      aliceStartTimeout = setTimeout(() => {
        startAlice(onAppOpened);
      }, 500);
    });

    alice.on('close', code => {
      console.log(`alice closed with code ${code}`);
      alice = null;
    });
  }
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

const restartAlice = async () => {
  console.log('Restarting ALice');
  const isReachable = await checkReachability();
  if (isReachable) {
    return;
  }
  closeAlice();
  await startAlice();
  await checkReachability();
};

const isReachable = () => {
  const options = {
    hostname: 'localhost',
    port,
    path: '/ping',
    method: 'GET',
    timeout: 500
  };

  return new Promise(resolve => {
    const req = http.request(options, res => {
      console.log(`statusCode: ${res.statusCode}`);

      res.on('data', body => {
        console.log(body.toString());
        resolve(body.toString().trim() === 'pong');
      });
    });

    req.on('error', error => {
      console.log(error);
      resolve(false);
    });

    req.end();
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
    ps.kill(id, resolve);
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
