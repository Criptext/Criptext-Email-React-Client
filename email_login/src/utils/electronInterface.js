import { labels } from './systemLabels';
import { openDialogWindow } from './ipc';
import lang from './../lang';
const electron = window.require('electron');
const { ipcRenderer, remote, webFrame } = electron;
const dbManager = remote.require('./src/DBManager');
const clientManager = remote.require('./src/clientManager');

export const { requiredMinLength, requiredMaxLength } = remote.require(
  './src/validationConsts'
);
export const errors = remote.require('./src/errors');
export const myAccount = remote.require('./src/Account');
export const mySettings = remote.require('./src/Settings');
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
  const texts = lang.dialogContent.confirmWaitingApprovalLogin;
  const dialog = remote.dialog;
  const RESPONSES = {
    CANCEL: {
      index: 0,
      label: texts.cancelResponse
    },
    KEEP: {
      index: 1,
      label: texts.keepResponse
    }
  };
  const dialogResponses = Object.values(RESPONSES).map(
    response => response.label
  );
  const dialogTemplate = {
    type: 'warning',
    title: texts.title,
    buttons: dialogResponses,
    defaultId: RESPONSES.KEEP.index,
    cancelId: RESPONSES.CANCEL.index,
    message: texts.message,
    detail: texts.detail,
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
  const texts = lang.dialogContent.confirmEmptyEmail;
  const dialogData = {
    title: texts.title,
    contentType: 'EMPTY_RECOVERY_EMAIL',
    options: {
      cancelLabel: texts.cancelLabel,
      acceptLabel: texts.acceptLabel
    },
    sendTo: 'login'
  };
  openDialogWindow(dialogData);
  ipcRenderer.once('selectedOption', (e, data) => {
    callback(data.selectedOption === texts.acceptLabel);
  });
};

export const confirmLostDevices = callback => {
  const texts = lang.dialogContent.confirmLostDevices;
  const dialogData = {
    title: texts.title,
    contentType: 'LOST_ALL_DEVICES',
    options: {
      cancelLabel: texts.cancelLabel,
      acceptLabel: texts.acceptLabel
    },
    sendTo: 'login'
  };
  openDialogWindow(dialogData);
  ipcRenderer.once('selectedOption', (e, data) => {
    callback(data.selectedOption === texts.acceptLabel);
  });
};

export const confirmForgotPasswordEmptyEmail = (customText, callback) => {
  const texts = lang.dialogContent.confirmForgotPasswordEmptyEmail;
  const dialogData = {
    title: texts.title,
    contentType: 'FORGOT_PASSWORD_EMPTY_EMAIL',
    customTextToReplace: customText,
    options: {
      cancelLabel: texts.cancelLabel,
      acceptLabel: texts.acceptLabel
    },
    sendTo: 'login'
  };
  openDialogWindow(dialogData);
  ipcRenderer.once('selectedOption', (e, data) => {
    callback(data.selectedOption === texts.acceptLabel);
  });
};

export const confirmForgotPasswordSentLink = (customText, callback) => {
  const texts = lang.dialogContent.confirmForgotPasswordSentLink;
  const dialogData = {
    title: texts.title,
    contentType: 'FORGOT_PASSWORD_SEND_LINK',
    customTextToReplace: customText,
    options: {
      acceptLabel: texts.acceptLabel
    },
    sendTo: 'login'
  };
  openDialogWindow(dialogData);
  ipcRenderer.once('selectedOption', (e, data) => {
    callback(data.selectedOption === texts.acceptLabel);
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

/* DataBase
  ----------------------------- */
export const createAccount = params => {
  return dbManager.createAccount(params);
};

export const createContact = params => {
  return dbManager.createContact(params);
};
