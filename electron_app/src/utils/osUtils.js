const os = require('os');

const getComputerName = () => {
  const hostname = os.hostname();
  const deviceName = hostname.split('.')[0];
  return deviceName.split('-').join(' ');
};

const isWindows = () => process.platform === 'win32';

const isLinux = () => process.platform === 'linux';

const isMacOs = () => process.platform === 'darwin';

module.exports = { getComputerName, isWindows, isLinux, isMacOs };
