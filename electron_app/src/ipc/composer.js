const { ipcMain: ipc } = require('@criptext/electron-better-ipc');
const composerWindowManager = require('../windows/composer');

ipc.answerRenderer(
  'close-composer',
  ({ composerId, emailId, discard, threadId, hasExternalPassphrase }) => {
    composerWindowManager.destroy({
      composerId,
      discard,
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

ipc.answerRenderer('save-draft-changes', windowParams => {
  const { composerId, data } = windowParams;
  composerWindowManager.saveDraftChanges(composerId, data);
});

ipc.answerRenderer('pause-auto-save', windowParams => {
  const { composerId } = windowParams;
  composerWindowManager.pauseAutoSave(composerId);
});

ipc.answerRenderer('resume-auto-save', windowParams => {
  const { composerId } = windowParams;
  composerWindowManager.resumeAutoSave(composerId);
});

ipc.answerRenderer('auto-save-draft', composerId => {
  composerWindowManager.autoSaveDraft(composerId);
});
