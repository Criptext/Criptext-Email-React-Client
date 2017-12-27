import * as Types from './types';

export const addThreads = threads => {
  return {
    type: Types.Thread.ADD_BATCH,
    threads: threads.sort((t1, t2) => {
      return t1.lastEmailDate <= t2.lastEmailDate;
    })
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
