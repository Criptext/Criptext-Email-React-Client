import { LabelType } from './const.js';
const electron = window.require('electron');
const remote = electron.remote;
const dbManager = remote.require('./src/DBManager');
const ipcRenderer = electron.ipcRenderer;

export const openComposerWindow = () => {
  ipcRenderer.send('create-composer');
};

export const createLabel = params => {
  return dbManager.createLabel(params);
};

export const getAllLabels = () => {
  return dbManager.getAllLabels();
};

export const getLabelById = id => {
  return dbManager.getLabelById(id);
};

export const updateLabel = params => {
  return dbManager.updateLabel(params);
};

export const getThreads = (timestamp, params) => {
  return dbManager.getThreads(timestamp, params);
};

export const getEmailsGroupByThreadByMatchText = filter => {
  return dbManager.getEmailsGroupByThreadByMatchText(filter);
};

export const getEmailsGroupByThreadByParams = params => {
  return dbManager.getEmailsGroupByThreadByParams(parseMailbox(params));
};

export const getEmailsByThreadId = threadId => {
  return dbManager.getEmailsByThreadId(threadId);
};

const parseMailbox = params => {
  switch (params.mailbox) {
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
    default: {
      return {
        ...params,
        mailbox: LabelType[params.mailbox]
          ? LabelType[params.mailbox].id
          : params.mailbox
      };
    }
  }
};

export const getEmailById = emailId => {
  return dbManager.getEmailById(emailId);
};

export const getAllFeeds = () => {
  return dbManager.getAllFeeds();
};

export const getUserByUsername = username => {
  return dbManager.getUserByUsername(username);
};

export const markFeedAsReadById = feedId => {
  return dbManager.markFeedAsReadById(feedId);
};

export const setMuteEmailById = (emailId, muteValue) => {
  return dbManager.setMuteEmailById(emailId, muteValue);
};

export const deleteFeedById = feedId => {
  return dbManager.deleteFeedById(feedId);
};
