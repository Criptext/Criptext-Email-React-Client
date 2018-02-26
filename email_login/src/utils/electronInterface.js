const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;
const remote = electron.remote;
const dbManager = remote.require('./src/DBManager');

export const closeLogin = () => {
  ipcRenderer.send('close-login');
};

export const confirmEmptyEmail = callback => {
  const dataForModal = {
    title: 'Warning!',
    content: [
      {
        paragraphContent: [
          { type: 'text', text: 'You did not set a ' },
          { type: 'strong', text: 'Recovery Email ' },
          {
            type: 'text',
            text:
              'so account recovery is impossible if you forget your password.'
          }
        ]
      },
      {
        paragraphContent: [
          { type: 'text', text: 'Proceed without recovery email?' }
        ]
      }
    ],
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
  const Modaltext =
    "With your privacy in mind, Criptext doesn't keep " +
    'any of your data stored in its servers. ' +
    'If you no longer have access to a device linked to your account, ' +
    "you'll start with a brand new inbox.";
  const dataForModal = {
    title: 'Lost all your devices',
    content: [
      {
        paragraphContent: [{ type: 'text', text: Modaltext }]
      }
    ],
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

export const closeDialog = () => {
  ipcRenderer.send('close-modal');
};

export const openLoading = () => {
  ipcRenderer.send('open-loading');
};

export const closeLoading = () => {
  ipcRenderer.send('close-loading');
};

export const openMailbox = () => {
  ipcRenderer.send('open-mailbox');
};

export const createUser = params => {
  return dbManager.createUser(params);
};

export const createSession = params => {
  return dbManager.createSession(params);
};
