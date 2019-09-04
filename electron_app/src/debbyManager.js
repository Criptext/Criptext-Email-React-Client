const { spawn } = require('child_process');
const path = require('path');
const { app } = require('electron');
const dbManager = require('./DBManager');
const portscanner = require('portscanner');

const getDebbyPath = nodeEnv => {
  switch (nodeEnv) {
    case 'development': {
      return path.join(__dirname, '../../db_interface/build/Release/trompita');
    }
    default: {
      return path.join(path.dirname(__dirname), '../extraResources', 'trompita');
    }
  }
};

let port = 8085;
let debby = null;
let debbyStartTimeout = null;

const getPort = () => {
  return port;
};

const startDebby = async () => {
  debbyStartTimeout = null;
  if (!debby) {
    const myPort = await portscanner.findAPortNotInUse(8085);
    port = myPort;

    const debbyPath = getDebbyPath(process.env.NODE_ENV);
    const dbpath = path.resolve(dbManager.databasePath);
    debby = spawn(debbyPath, [dbpath, myPort]);
    debby.stdout.on('data', data => {
      console.log(`-----debby-----\n${data}\n -----end-----`);
    });
    debby.on('exit', (code, signal) => {
      console.log(`debby exited with code ${code} and signal ${signal}`);
      debby = null;
      if (signal !== 'SIGTERM' && signal !== 'SIGABRT') {
        return;
      }
      debbyStartTimeout = setTimeout(() => {
        startDebby();
      }, 500);
    });

    debby.on('close', code => {
      console.log(`debby closed with code ${code}`);
      debby = null;
    });
  }
};

const closeDebby = () => {
  if (debby) {
    debby.kill();
    debby = null;
  } else if (debbyStartTimeout) {
    clearTimeout(debbyStartTimeout);
    debbyStartTimeout = null;
  }
};

const restartDebby = async () => {
  if (debby) {
    return;
  }
  if (debbyStartTimeout) {
    clearTimeout(debbyStartTimeout);
    debbyStartTimeout = null;
  }
  await startDebby();
};

module.exports = {
  startDebby,
  restartDebby,
  closeDebby,
  getPort
};
