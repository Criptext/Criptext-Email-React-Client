const os = require('os');

const getComputerName = () => {
  const hostname = os.hostname();
  const deviceName = hostname.split('.')[0];
  return deviceName.split('-').join(' ');
};

module.exports = { getComputerName };
