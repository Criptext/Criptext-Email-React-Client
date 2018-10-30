/* eslint-env node */
const { callMain } = require('@criptext/electron-better-ipc/renderer');

const getComputerName = () => callMain('get-computer-name');

module.exports = { getComputerName };
