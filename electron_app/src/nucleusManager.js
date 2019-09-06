const { APP_VERSION, NUCLEUS_ID } = require('./utils/const');
const myAccount = require('./Account');
const mySettings = require('./Settings');
let Nucleus;

const initNucleus = ({ userId }) => {
  const data = {
    onlyMainProcess: true,
    userId: userId || 'unknown',
    version: APP_VERSION
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
