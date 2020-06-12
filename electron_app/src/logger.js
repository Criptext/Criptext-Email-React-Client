const winston = require('winston');
const { combine, timestamp, json } = winston.format;
const WinstonRotation = require('winston-daily-rotate-file');
const path = require('path');
const { app } = require('electron');

const getLogsPath = node_env => {
  switch (node_env) {
    case 'test': {
      return './src/__integrations__/alice_logs.txt';
    }
    case 'development': {
      return path.normalize(__dirname).replace('/app.asar', '');
    }
    default: {
      const userDataPath = app.getPath('userData');
      return path.normalize(userDataPath).replace('/app.asar', '');
    }
  }
};

const rotationOpts = {
  filename: 'criptext-app.log',
  dirname: getLogsPath(process.env.NODE_ENV),
  datePattern: 'YYYY-MM-DD-HH',
  frequency: '48h',
  maxSize: '20m',
  maxFiles: '2'
};

const logger = winston.createLogger({
  level: 'debug',
  format: combine(timestamp(), json()),
  transports: [
    new winston.transports.Console(),
    new WinstonRotation(rotationOpts)
  ]
});

module.exports = logger;
