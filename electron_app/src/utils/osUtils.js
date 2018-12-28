const os = require('os');
const getos = require('getos');

const getComputerName = () => {
  const hostname = os.hostname();
  const deviceName = hostname.split('.')[0];
  return deviceName.split('-').join(' ');
};

const isWindows = () => process.platform === 'win32';

const isLinux = () => process.platform === 'linux';

const isMacOs = () => process.platform === 'darwin';

const getOsAndArch = () => {
  return new Promise(resolve => {
    getos((err, res) => {
      if (err) {
        resolve('');
      }
      resolve(`${res.os} ${res.dist} ${res.release} ${process.arch}`);
    });
  });
};

module.exports = { getComputerName, isWindows, isLinux, isMacOs, getOsAndArch };
