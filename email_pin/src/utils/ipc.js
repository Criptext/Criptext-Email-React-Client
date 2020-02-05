import ipc from '@criptext/electron-better-ipc/renderer';

/*  Windows call
----------------------------- */
export const closePinWindow = params => {
  ipc.callMain('close-pin', params);
};

export const maximizePinWindow = () => {
  ipc.callMain('maximize-pin');
};

export const minimizePinWindow = () => {
  ipc.callMain('minimize-pin');
};

export const openCreateKeysLoadingWindow = params => {
  ipc.callMain('open-create-keys-loading', params);
};

export const sendPin = params => ipc.callMain('send-pin', params);

export const upApp = ({ shouldSave, pin }) => {
  ipc.callMain('app-up', { shouldSave, pin });
};

export const validatePin = async pin => {
  return await ipc.callMain('validate-pin', pin);
};

export const storeRecoveryKey = params =>
  ipc.callMain('store-recovery-key', params);

export const getRecoveryKey = params =>
  ipc.callMain('get-recovery-key', params);

export const startResetKey = async () => {
  return await ipc.callMain('reset-key-start');
};
