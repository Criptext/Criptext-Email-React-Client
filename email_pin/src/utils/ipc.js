import { callMain } from '@criptext/electron-better-ipc/renderer';

/*  Windows call
----------------------------- */
export const closePinWindow = params => {
  callMain('close-pin', params);
};

export const maximizePinWindow = () => {
  callMain('maximize-pin');
};

export const minimizePinWindow = () => {
  callMain('minimize-pin');
};

export const openCreateKeysLoadingWindow = params => {
  callMain('open-create-keys-loading', params);
};

export const sendPin = params => callMain('send-pin', params);

export const upApp = ({ shouldSave, pin }) => {
  callMain('app-up', { shouldSave, pin });
};

export const validatePin = async pin => {
  return await callMain('validate-pin', pin);
};

export const storeRecoveryKey = params =>
  callMain('store-recovery-key', params);

export const getRecoveryKey = params => callMain('get-recovery-key', params);

export const startResetKey = async () => {
  return await callMain('reset-key-start');
};
