const electron = window.require('electron');
const remote = electron.remote;
const dbManager = remote.require('./src/DBManager');
const ipcRenderer = electron.ipcRenderer;

export const openComposerWindow = () => {
  ipcRenderer.send('create-composer');
};

export const getThreads = (timestamp, params) => {
  return dbManager.getThreads(timestamp, params);
};

export const getAllLabels = () => {
  return dbManager.getAllLabels();
};

export const simpleThreadsFilter = filter => {
  return dbManager.simpleThreadsFilter(filter);
};

export const getThreadsFilter = params => {
  return dbManager.getThreadsFilter(parseMailbox(params));
};

const parseMailbox = params => {
  switch (params.mailbox) {
    case 'inbox': {
      return {
        ...params,
        mailbox: 1
      };
    }
    case 'spam': {
      return {
        ...params,
        mailbox: 2
      };
    }
    case 'sent': {
      return {
        ...params,
        mailbox: 3
      };
    }
    case 'draft': {
      return {
        ...params,
        mailbox: -1,
        getDrafts: true
      };
    }
    case 'trash': {
      return {
        ...params,
        mailbox: -1,
        getTrash: -1
      };
    }
    case 'starred': {
      return {
        ...params,
        mailbox: 7
      };
    }
    default: {
      return params;
    }
  }
};
