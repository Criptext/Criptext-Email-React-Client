const { ipcMain: ipc } = require('@criptext/electron-better-ipc');
const { addEventError, NUCLEUS_EVENTS } = require('./../nucleusManager');

ipc.answerRenderer('nucleups-report-content-unencrypted', error =>
  addEventError(NUCLEUS_EVENTS.REPORT_CONTENT_UNENCRYPTED, error)
);

ipc.answerRenderer('nucleups-report-content-unencrypted-bob', error =>
  addEventError(NUCLEUS_EVENTS.REPORT_CONTENT_UNENCRYPTED_BOB, error)
);

ipc.answerRenderer('nucleups-report-uncaught-error', error =>
  addEventError(NUCLEUS_EVENTS.UNCAUGHT_ERROR, error)
);
