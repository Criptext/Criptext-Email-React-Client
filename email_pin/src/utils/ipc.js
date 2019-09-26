import { callMain } from '@criptext/electron-better-ipc/renderer';

/*  Windows call
----------------------------- */
export const closePinWindow = () => {
  callMain('close-pin');
};

export const maximizePinWindow = () => {
  callMain('maximize-pin');
};

export const minimizePinWindow = () => {
  callMain('minimize-pin');
};

export const sendPin = params => {
  callMain('send-pin', params);
};
