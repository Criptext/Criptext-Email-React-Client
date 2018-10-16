const { remote } = window.require('electron');
export const { appDomain } = remote.require('./src/utils/const');

export const DEVICE_TYPE = 1;

export const SocketCommand = {
  DATA_UPLOADED: 204
};
