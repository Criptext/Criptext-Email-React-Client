import * as Types from './types';

export const addThreads = threads => {
  let newThreads = threads;
  if (Array.isArray(newThreads)) {
    newThreads = {};
    threads.forEach(thread => {
      newThreads[thread.id.toString()] = thread;
    });
  }
  return {
    type: Types.Thread.ADD_BATCH,
    threads: newThreads
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
