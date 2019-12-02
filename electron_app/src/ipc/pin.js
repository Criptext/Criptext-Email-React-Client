const { ipcMain: ipc } = require('@criptext/electron-better-ipc');
const pinWindow = require('../windows/pin');
const globalManager = require('../globalManager');
const recoveryKey = require('../recoveryKey.js');
const fileUtils = require('../utils/FileUtils');

ipc.answerRenderer('close-pin', () => {
  pinWindow.close();
  globalManager.pingData.set({});
});

ipc.answerRenderer('maximize-pin', () => {
  pinWindow.toggleMaximize();
});

ipc.answerRenderer('minimize-pin', () => {
  pinWindow.minimize();
});

ipc.answerRenderer('open-pin', params => {
  globalManager.pinData.set(params);
  pinWindow.show();
});

ipc.answerRenderer('send-pin', params => pinWindow.setUpPin(params));

ipc.answerRenderer('validate-pin', pin => pinWindow.validatePin(pin));

ipc.answerRenderer('store-recovery-key', async ({ salt, iv, encryptedPin }) => {
  const storePath = recoveryKey.getPath(process.env.NODE_ENV);
  const data = salt.concat(iv).concat(encryptedPin);
  try {
    await fileUtils.store(storePath, Uint8Array.from(data));
  } catch (e) {
    console.error(e);
    return false;
  }
  return true;
});

ipc.answerRenderer('get-recovery-key', async () => {
  const storePath = recoveryKey.getPath(process.env.NODE_ENV);
  try {
    const data = await fileUtils.retrieve(storePath);
    const dataArray = Uint8Array.from(data);
    const salt = dataArray.slice(0, 8);
    const iv = dataArray.slice(8, 24);
    const encryptedPin = dataArray.slice(24);
    return {
      iv,
      salt,
      encryptedPin
    };
  } catch (e) {
    console.error(e);
    return;
  }
});
