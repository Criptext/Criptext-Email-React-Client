const ipc = require('@criptext/electron-better-ipc');
const { app, dialog } = require('electron');
const { getComputerName, isWindows } = require('../utils/osUtils');
const { processEventsQueue } = require('../eventQueueManager');
const { showNotification } = require('../updater');

ipc.answerRenderer('get-computer-name', () => getComputerName());
ipc.answerRenderer('get-isWindows', () => isWindows());

ipc.answerRenderer('process-pending-events', () => {
  processEventsQueue();
});

ipc.answerRenderer('show-notification', ({ title, message }) => {
  showNotification({ title, message });
});

ipc.answerRenderer('throwError', ({ name, description }) => {
  dialog.showErrorBox(name, description);
});

ipc.answerRenderer('update-dock-badge', value => {
  const currentBadge = app.getBadgeCount();
  if (currentBadge !== value) {
    app.setBadgeCount(value);
  }
});
