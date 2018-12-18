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
export const mySettings = remote.require('./src/Settings');
export const LabelType = labels;
export const socketClient = remote.require('./src/socketClient');

const globalManager = remote.require('./src/globalManager');

webFrame.setVisualZoomLevelLimits(1, 1);
webFrame.setLayoutZoomLevelLimits(0, 0);

const isSpanish = window.navigator.language.indexOf('es') > -1;

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
      label: isSpanish ? 'Cancelar' : 'Cancel'
    },
    KEEP: {
      index: 1,
      label: isSpanish ? 'Seguir esperando' : 'Keep waiting'
    }
  };
  const dialogResponses = Object.values(RESPONSES).map(
    response => response.label
  );
  const dialogTemplate = {
    type: 'warning',
    title: isSpanish ? 'Esto es extraño' : "Well, that's odd...",
    buttons: dialogResponses,
    defaultId: RESPONSES.KEEP.index,
    cancelId: RESPONSES.CANCEL.index,
    message: isSpanish
      ? 'Sucedió algo que está demorando este proceso'
      : 'Something has happened that is delaying this process.',
    detail: isSpanish
      ? '¿Deseas seguir esperando?'
      : 'Do you want to continue waiting?',
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
    title: isSpanish ? 'Advertencia' : 'Warning!',
    contentType: 'EMPTY_RECOVERY_EMAIL',
    options: {
      cancelLabel: isSpanish ? 'Cancelar' : 'Cancel',
      acceptLabel: isSpanish ? 'Confirmar' : 'Confirm'
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
    title: isSpanish ? 'Ingreso con contraseña' : 'Password Login',
    contentType: 'LOST_ALL_DEVICES',
    options: {
      cancelLabel: isSpanish ? 'Cerrar' : 'Close',
      acceptLabel: isSpanish ? 'Continuar' : 'Continue'
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
    title: isSpanish ? 'Avertencia' : 'Alert!',
    contentType: 'FORGOT_PASSWORD_EMPTY_EMAIL',
    customTextToReplace: customText,
    options: {
      cancelLabel: isSpanish ? 'Cancelar' : 'Cancel',
      acceptLabel: isSpanish ? 'Entendido' : 'Ok'
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
    title: isSpanish ? 'Olvido de contraeña' : 'Forgot Password',
    contentType: 'FORGOT_PASSWORD_SEND_LINK',
    customTextToReplace: customText,
    options: {
      acceptLabel: isSpanish ? 'Entendido' : 'Ok'
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
