const { ipcMain: ipc } = require('@criptext/electron-better-ipc');
const logger = require('../logger');

ipc.answerRenderer('log-error', stack => {
  logger.error(stack);
});

ipc.answerRenderer('log-info', stack => {
  logger.info(stack);
});
