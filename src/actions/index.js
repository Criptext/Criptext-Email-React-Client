import * as Types from './types';

export const addThreads = threads => {
  return {
    type: Types.Thread.ADD_BATCH,
    threads: threads
  };
};

export const addUsers = users => {
  return {
    type: Types.User.ADD_BATCH,
    users: users
  };
};

export const addUser = user => {
  return {
    type: Types.User.ADD,
    user: user
  };
};

export const selectThread = threadId => {
  return {
    type: Types.Thread.SELECT,
    selectedThread: threadId
  };
};
