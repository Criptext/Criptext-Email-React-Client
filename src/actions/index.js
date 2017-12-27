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

export const loadThreads = () => {
  return dispatch => {
    return fetch('/threads.json')
      .then(response => {
        if (response.status === 200) {
          return response.json();
        }
        return Promise.reject(response.status);
      })
      .then(json => {
        dispatch(addThreads(json.threads));
      })
      .catch(err => {
        console.error(err);
      });
  };
};
