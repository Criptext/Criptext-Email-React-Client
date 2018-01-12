import {Thread} from './types';

export const addThreads = threads => {
  return {
    type: Thread.ADD_BATCH,
    threads: threads.sort((t1, t2) => {
      return t1.lastEmailDate <= t2.lastEmailDate;
    })
  };
};

export const selectThread = threadId => {
  return {
    type: Thread.SELECT,
    selectedThread: threadId
  };
};

export const multiSelectThread = (threadId, value) => {
  return {
    type: Thread.MULTISELECT,
    selectedThread: threadId,
    value: value
  };
};

export const filterThreadsByUnread = enabled => {
  return {
    type: Thread.UNREAD_FILTER,
    enabled: enabled
  };
};

export const addThreadLabel = (threadId, label) => {
  return {
    type: Thread.ADD_THREAD_LABEL,
    targetThread: threadId,
    label: label
  };
};

export const addThreadsLabel = (threadId, label) => {
  return {
    type: Thread.ADD_THREADS_LABEL,
    threadsIds: threadId,
    label: label
  };
};

export const removeThreadLabel = (threadId, label) => {
  return {
    type: Thread.REMOVE_LABEL,
    targetThread: threadId,
    label: label
  };
};

export const removeThreadsLabel = (threadId, label) => {
  return {
    type: Thread.REMOVE_THREADS_LABEL,
    threadsIds: threadId,
    label: label
  };
};

export const removeThread = threadId => {
  return {
    type: Thread.REMOVE,
    targetThread: threadId
  };
};

export const removeThreads = threadsIds => {
  return {
    type: Thread.REMOVE_THREADS,
    targetThreads: threadsIds
  };
};

export const deselectThreads = spread => {
  return {
    type: Thread.DESELECT_THREADS,
    spread
  };
};

export const selectThreads = () => {
  return {
    type: Thread.SELECT_THREADS
  };
};

export const moveThreads = (threadsIds, label) => {
  return {
    label,
    threadsIds,
    type: Thread.MOVE_THREADS
  };
};

export const markThreadsRead = (threadsIds, read) => {
  return {
    threadsIds,
    read,
    type: Thread.READ_THREADS
  };
};

export const loadThreads = () => {
  return async dispatch => {
    try {
      const response = await fetch('/threads.json');
      const json = await response.json();
      dispatch(addThreads(json.threads));
    } catch (e) {
      console.log(e);
    }
  };
};
