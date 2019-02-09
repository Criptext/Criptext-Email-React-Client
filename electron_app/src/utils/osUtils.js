const os = require('os');
const getos = require('getos');
const packagedata = require('./../../package.json');

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
      const data = {
        os: res.os,
        distribution: res.dist,
        distVersion: res.release,
        arch: process.arch,
        installerType: packagedata.criptextInstallerType
      };
      resolve(data);
    });
  });
};

module.exports = { getComputerName, isWindows, isLinux, isMacOs, getOsAndArch };
