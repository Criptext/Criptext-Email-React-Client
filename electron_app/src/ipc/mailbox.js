const ipc = require('@criptext/electron-better-ipc');
const mailboxWindow = require('../windows/mailbox');

ipc.answerRenderer('open-file-explorer', filename => {
  mailboxWindow.showFileExplorer(filename);
});
