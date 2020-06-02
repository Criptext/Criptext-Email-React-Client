const { APP_VERSION, NUCLEUS_ID, INSTALLER_TYPE } = require('./utils/const');
const myAccount = require('./Account');
let Nucleus;

const initNucleus = ({ userId, language }) => {
  const data = {
    onlyMainProcess: true,
    userId: userId || 'unknown',
    version: APP_VERSION,
    language
  };
  Nucleus = require('electron-nucleus')(NUCLEUS_ID, data);
};

const addEventError = (event, data) => {
  Nucleus.trackError(event, data);
};

const addEventTrack = (event, data) => {
  Nucleus.track(event, data);
};

const updateUserData = () => {
  Nucleus.setUserId(myAccount.recipientId);
  Nucleus.setProps({
    installerType: INSTALLER_TYPE
  });
};

const NUCLEUS_EVENTS = {
  LOGIN_OPENED: 'LOGIN_OPENED',
  LOGIN_NEW_USER: 'LOGIN_NEW_USER',
  LOGIN_NEW_DEVICE: 'LOGIN_NEW_DEVICE',
  LOGIN_NEW_ENTERPRISE: 'LOGIN_NEW_ENTERPRISE',
  MAILBOX_OPENED: 'MAILBOX_OPENED',
  NEW_USER: 'NEW_USER',
  POST_PEER_EVENT: 'POST_PEER_EVENT',
  REPORT_CONTENT_UNENCRYPTED: 'REPORT_CONTENT_UNENCRYPTED',
  UNCAUGHT_ERROR: 'UNCAUGHT_ERROR'
};

module.exports = {
  initNucleus,
  addEventError,
  addEventTrack,
  updateUserData,
  NUCLEUS_EVENTS
};
