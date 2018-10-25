import { labels } from './systemLabels';
const electron = window.require('electron');
const { ipcRenderer, remote, webFrame } = electron;
const dbManager = remote.require('./src/DBManager');
const clientManager = remote.require('./src/clientManager');

export const { requiredMinLength, requiredMaxLength } = remote.require(
  './src/validationConsts'
);
export const errors = remote.require('./src/errors');
export const myAccount = remote.require('./src/Account');
export const LabelType = labels;
export const socketClient = remote.require('./src/socketClient');
export const { getComputerName } = remote.require('./src/utils/StringUtils');

const globalManager = remote.require('./src/globalManager');

webFrame.setVisualZoomLevelLimits(1, 1);
webFrame.setLayoutZoomLevelLimits(0, 0);

export const createTemporalAccount = accountData => {
  return globalManager.temporalAccount.set(accountData);
};

export const getTemporalAccount = () => {
  return globalManager.temporalAccount.get();
};

export const deleteTemporalAccount = () => {
  return globalManager.temporalAccount.delete();
};

/* Window events
  ----------------------------- */
export const closeDialog = () => {
  ipcRenderer.send('close-modal');
};

export const closeLoading = () => {
  ipcRenderer.send('close-loading');
};

export const closeLogin = () => {
  ipcRenderer.send('close-login');
};

export const confirmEmptyEmail = callback => {
  const dataForModal = {
    title: 'Warning!',
    contentType: 'EMPTY_RECOVERY_EMAIL',
    options: {
      cancelLabel: 'Cancel',
      acceptLabel: 'Confirm'
    },
    sendTo: 'login'
  };
  ipcRenderer.send('open-modal', dataForModal);
  ipcRenderer.once('selectedOption', (event, data) => {
    callback(data.selectedOption);
  });
};

export const confirmLostDevices = callback => {
  const dataForModal = {
    title: 'Password Login',
    contentType: 'LOST_ALL_DEVICES',
    options: {
      cancelLabel: 'Close',
      acceptLabel: 'Continue'
    },
    sendTo: 'login'
  };
  ipcRenderer.send('open-modal', dataForModal);
  ipcRenderer.once('selectedOption', (event, data) => {
    callback(data.selectedOption);
  });
};

export const confirmForgotPasswordEmptyEmail = (customText, callback) => {
  const dataForModal = {
    title: 'Alert!',
    contentType: 'FORGOT_PASSWORD_EMPTY_EMAIL',
    customTextToReplace: customText,
    options: {
      cancelLabel: 'Cancel',
      acceptLabel: 'Ok'
    },
    sendTo: 'login'
  };
  ipcRenderer.send('open-modal', dataForModal);
  ipcRenderer.once('selectedOption', (event, data) => {
    callback(data.selectedOption);
  });
};

export const confirmForgotPasswordSentLink = (customText, callback) => {
  const dataForModal = {
    title: 'Forgot Password',
    contentType: 'FORGOT_PASSWORD_SEND_LINK',
    customTextToReplace: customText,
    options: {
      acceptLabel: 'Ok'
    },
    sendTo: 'login'
  };
  ipcRenderer.send('open-modal', dataForModal);
  ipcRenderer.once('selectedOption', (event, data) => {
    callback(data.selectedOption);
  });
};

export const hideLogin = () => {
  ipcRenderer.send('hide-login');
};

export const minimizeLogin = () => {
  ipcRenderer.send('minimize-login');
};

export const openCreateKeys = params => {
  ipcRenderer.send('open-create-keys', params);
};

export const openMailbox = () => {
  ipcRenderer.send('open-mailbox');
};

export const throwError = error => {
  ipcRenderer.send('throwError', error);
};

/* Criptext Client
  ----------------------------- */
export const checkAvailableUsername = username => {
  return clientManager.checkAvailableUsername(username);
};

export const linkBegin = username => {
  return clientManager.linkBegin(username);
};

export const linkAuth = newDeviceData => {
  return clientManager.linkAuth(newDeviceData);
};

export const login = params => {
  return clientManager.login(params);
};

export const postUser = params => {
  return clientManager.postUser(params);
};

export const resetPassword = recipientId => {
  return clientManager.resetPassword(recipientId);
};

/* DataBase
  ----------------------------- */
export const createAccount = params => {
  return dbManager.createAccount(params);
};

export const createContact = params => {
  return dbManager.createContact(params);
};

export const createLabel = params => {
  return dbManager.createLabel(params);
};

export const createIdentityKeyRecord = params => {
  return dbManager.createIdentityKeyRecord(params);
};

export const createPreKeyRecord = params => {
  return dbManager.createPreKeyRecord(params);
};

export const createSessionRecord = params => {
  return dbManager.createSessionRecord(params);
};

export const createSignedPreKeyRecord = params => {
  return dbManager.createSignedPreKeyRecord(params);
};

export const deletePreKeyPair = params => {
  return dbManager.deletePreKeyPair(params);
};

export const deleteSessionRecord = params => {
  return dbManager.deleteSessionRecord(params);
};

export const getAccount = () => {
  return dbManager.getAccount();
};

export const getIdentityKeyRecord = params => {
  return dbManager.getIdentityKeyRecord(params);
};

export const getPreKeyPair = params => {
  return dbManager.getPreKeyPair(params);
};

export const getSessionRecord = params => {
  return dbManager.getSessionRecord(params);
};

export const getSignedPreKey = params => {
  return dbManager.getSignedPreKey(params);
};

export const updateIdentityKeyRecord = params => {
  return dbManager.updateIdentityKeyRecord(params);
};
