import { labels } from './systemLabels';
import { openDialogWindow } from './ipc';
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

export const confirmWaitingApprovalLogin = callback => {
  const dialog = remote.dialog;
  const RESPONSES = {
    CANCEL: {
      index: 0,
      label: 'Cancel'
    },
    KEEP: {
      index: 1,
      label: 'Keep waiting'
    }
  };
  const dialogResponses = Object.values(RESPONSES).map(
    response => response.label
  );
  const dialogTemplate = {
    type: 'warning',
    title: "Well, that's odd...",
    buttons: dialogResponses,
    defaultId: RESPONSES.KEEP.index,
    cancelId: RESPONSES.CANCEL.index,
    message: 'Something has happened that is delaying this process.',
    detail: 'Do you want to continue waiting?',
    noLink: true
  };
  dialog.showMessageBox(dialogTemplate, responseIndex => {
    const response = responseIndex === RESPONSES.KEEP.index;
    callback(response);
  });
};

/* Window events
  ----------------------------- */
export const closeLoading = () => {
  ipcRenderer.send('close-loading');
};

export const confirmEmptyEmail = callback => {
  const dialogData = {
    title: 'Warning!',
    contentType: 'EMPTY_RECOVERY_EMAIL',
    options: {
      cancelLabel: 'Cancel',
      acceptLabel: 'Confirm'
    },
    sendTo: 'login'
  };
  openDialogWindow(dialogData);
  ipcRenderer.once('selectedOption', (event, data) => {
    callback(data.selectedOption);
  });
};

export const confirmLostDevices = callback => {
  const dialogData = {
    title: 'Password Login',
    contentType: 'LOST_ALL_DEVICES',
    options: {
      cancelLabel: 'Close',
      acceptLabel: 'Continue'
    },
    sendTo: 'login'
  };
  openDialogWindow(dialogData);
  ipcRenderer.once('selectedOption', (event, data) => {
    callback(data.selectedOption);
  });
};

export const confirmForgotPasswordEmptyEmail = (customText, callback) => {
  const dialogData = {
    title: 'Alert!',
    contentType: 'FORGOT_PASSWORD_EMPTY_EMAIL',
    customTextToReplace: customText,
    options: {
      cancelLabel: 'Cancel',
      acceptLabel: 'Ok'
    },
    sendTo: 'login'
  };
  openDialogWindow(dialogData);
  ipcRenderer.once('selectedOption', (event, data) => {
    callback(data.selectedOption);
  });
};

export const confirmForgotPasswordSentLink = (customText, callback) => {
  const dialogData = {
    title: 'Forgot Password',
    contentType: 'FORGOT_PASSWORD_SEND_LINK',
    customTextToReplace: customText,
    options: {
      acceptLabel: 'Ok'
    },
    sendTo: 'login'
  };
  openDialogWindow(dialogData);
  ipcRenderer.once('selectedOption', (event, data) => {
    callback(data.selectedOption);
  });
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

export const linkStatus = () => {
  return clientManager.linkStatus();
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
