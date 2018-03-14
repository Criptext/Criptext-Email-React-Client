const electron = window.require('electron');
const { ipcRenderer, remote } = electron;
const dbManager = remote.require('./src/DBManager');

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
    }
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
    }
  };
  ipcRenderer.send('open-modal', dataForModal);
  ipcRenderer.once('selectedOption', (event, data) => {
    callback(data.selectedOption);
  });
};

export const confirmForgotPasswordEmptyEmail = callback => {
  const dataForModal = {
    title: 'Alert!',
    contentType: 'FORGOT_PASSWORD_EMPTY_EMAIL',
    options: {
      cancelLabel: 'Cancel',
      acceptLabel: 'Ok'
    }
  };
  ipcRenderer.send('open-modal', dataForModal);
  ipcRenderer.once('selectedOption', (event, data) => {
    callback(data.selectedOption);
  });
};

export const confirmForgotPasswordSentLink = callback => {
  const dataForModal = {
    title: 'Forgot Password?',
    contentType: 'FORGOT_PASSWORD_SENT_LINK',
    options: {
      cancelLabel: 'Cancel',
      acceptLabel: 'Ok'
    }
  };
  ipcRenderer.send('open-modal', dataForModal);
  ipcRenderer.once('selectedOption', (event, data) => {
    callback(data.selectedOption);
  });
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

/* Signal
  ----------------------------- */

export const createKeys = params => {
  return dbManager.createKeys(params);
};

export const getKeys = params => {
  return dbManager.getKeys(params);
};

export const getPreKeyPair = params => {
  return dbManager.getPreKeyPair(params);
};

export const getSignedPreKey = params => {
  return dbManager.getSignedPreKey(params);
};

export const createAccount = params => {
  return dbManager.createAccount(params);
};

export const getAccount = () => {
  return dbManager.getAccount();
};
