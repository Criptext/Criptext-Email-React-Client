const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

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
    title: 'Lost all your devices',
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

export const openCreateKeys = params => {
  ipcRenderer.send('open-create-keys', params);
};

export const openMailbox = () => {
  ipcRenderer.send('open-mailbox');
};

export const createContact = params => {
  return dbManager.createContact(params);
};

export const createAccount = params => {
  return dbManager.createAccount(params);
};
