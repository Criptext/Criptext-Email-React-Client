const { spawn } = require('child_process');
const path = require('path');
const dbManager = require('./DBManager');
const portscanner = require('portscanner');

const getAlicePath = nodeEnv => {
  switch (nodeEnv) {
    case 'development': {
      return path.join(__dirname, '../../signal_interface/build/Release/alice');
    }
    default: {
      return path.join(path.dirname(__dirname), '../extraResources', 'alice');
    }
  }
};

let port = 8085;
let alice = null;
let aliceStartTimeout = null;

const getPort = () => {
  return port;
};

const startAlice = async () => {
  aliceStartTimeout = null;
  if (!alice) {
    const myPort = await portscanner.findAPortNotInUse(8085);
    port = myPort;
    console.log(`port available ${myPort}`);
    const alicePath = getAlicePath(process.env.NODE_ENV);
    const dbpath = path.resolve(dbManager.databasePath);
    alice = spawn(alicePath, [dbpath, myPort]);
    alice.stdout.on('data', data => {
      console.log(`-----alice-----\n${data}\n -----end-----`);
    });
    alice.on('exit', (code, signal) => {
      console.log(`alice exited with code ${code} and signal ${signal}`);
      alice = null;
      if (signal !== 'SIGTERM') {
        return;
      }
      aliceStartTimeout = setTimeout(() => {
        startAlice();
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
  if (alice) {
    return;
  }
  if (aliceStartTimeout) {
    clearTimeout(aliceStartTimeout);
    aliceStartTimeout = null;
  }
  await startAlice();
};

module.exports = {
  startAlice,
  restartAlice,
  closeAlice,
  getPort
};
