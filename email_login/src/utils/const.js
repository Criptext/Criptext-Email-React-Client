/*global process */
export const appDomain =
  process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_APPDOMAIN
    : 'criptext.com';

export const DEVICE_TYPE = 1;

export const SocketCommand = {
  DEVICE_LINK_AUTHORIZATION_CONFIRMATION: 202,
  DEVICE_LINK_AUTHORIZATION_DENY: 206
};
