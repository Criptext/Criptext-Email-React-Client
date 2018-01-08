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

export const multiSelectThread = (threadId, value) => {
  return {
    type: Types.Thread.MULTISELECT,
    selectedThread: threadId,
    value: value
  };
};

export const filterThreadsByUnread = enabled => {
  return {
    type: Types.Thread.UNREAD_FILTER,
    enabled: enabled
  };
};

export const addLabel = (threadId, label) => {
  return {
    type: Types.Thread.ADD_LABEL,
    targetThread: threadId,
    label: label
  };
};

export const removeLabel = (threadId, label) => {
  return {
    type: Types.Thread.REMOVE_LABEL,
    targetThread: threadId,
    label: label
  };
};

export const removeThread = (threadId) => {
  return {
    type: Types.Thread.REMOVE,
    targetThread: threadId
  }
}

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
