const ipc = require('@criptext/electron-better-ipc');
const composerWindowManager = require('../windows/composer');

ipc.answerRenderer('open-filled-composer', async data => {
  await composerWindowManager.editDraft(data);
});

ipc.answerRenderer('open-empty-composer', () => {
  composerWindowManager.openNewComposer();
});
