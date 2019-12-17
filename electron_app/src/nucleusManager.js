const { APP_VERSION, NUCLEUS_ID, INSTALLER_TYPE } = require('./utils/const');
const myAccount = require('./Account');
const Nucleus = require('nucleus-nodejs');

const initNucleus = ({ userId, language }) => {
  const data = {
    persist: true,
    onlyMainProcess: true,
    userId: userId || 'unknown',
    version: APP_VERSION,
    language
  };
  Nucleus.init(NUCLEUS_ID, data);
  Nucleus.appStarted();
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
  REPORT_CONTENT_UNENCRYPTED: 'REPORT_CONTENT_UNENCRYPTED'
};

module.exports = {
  initNucleus,
  addEventError,
  addEventTrack,
  updateUserData,
  NUCLEUS_EVENTS
};
