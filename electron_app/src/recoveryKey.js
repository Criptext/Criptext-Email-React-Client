require('dotenv').config();

const path = require('path');
const { app } = require('electron');

const getPath = node_env => {
  switch (node_env) {
    case 'test': {
      return './src/__integrations__/test.db';
    }
    case 'development': {
      return path
        .join(__dirname, 'recovery.key')
        .replace('/app.asar', '')
        .replace('/src/database', '');
    }
    default: {
      const userDataPath = app.getPath('userData');
      return path
        .join(userDataPath, '/recovery.key')
        .replace('/app.asar', '')
        .replace('/src/database', '');
    }
  }
};

module.exports = {
  getPath
};
