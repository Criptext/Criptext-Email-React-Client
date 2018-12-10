const ipc = require('@criptext/electron-better-ipc');
const composerWindowManager = require('../windows/composer');

ipc.answerRenderer(
  'close-composer',
  ({ composerId, emailId, threadId, hasExternalPassphrase }) => {
    composerWindowManager.destroy({
      composerId,
      emailId,
      threadId,
      hasExternalPassphrase
    });
  }
);

ipc.answerRenderer('open-empty-composer', () => {
  composerWindowManager.openNewComposer();
});

ipc.answerRenderer('open-filled-composer', async data => {
  await composerWindowManager.editDraft(data);
});
