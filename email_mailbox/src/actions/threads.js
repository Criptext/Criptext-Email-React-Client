import { Thread, General } from './types';
import { getThreadsFilter } from '../utils/electronInterface';
import { storeValue } from '../utils/storage';

export const addThreads = (threads, clear) => ({
  type: Thread.ADD_BATCH,
  threads: threads,
  clear: clear
});

export const selectThread = thread => ({
  type: Thread.SELECT,
  thread
});

export const closeThread = () => ({
  type: Thread.CLOSE_THREAD
});

export const multiSelectThread = (threadId, value) => ({
  type: Thread.MULTISELECT,
  selectedThread: threadId,
  value: value
});

export const filterThreadsByUnread = enabled => ({
  type: Thread.UNREAD_FILTER,
  enabled: enabled
});

export const addThreadLabel = (threadId, label) => ({
  type: Thread.ADD_THREAD_LABEL,
  targetThread: threadId,
  label: label
});

export const addThreadsLabel = (threadId, label) => ({
  type: Thread.ADD_THREADS_LABEL,
  threadsIds: threadId,
  label: label
});

export const removeThreadLabel = (threadId, label) => ({
  type: Thread.REMOVE_LABEL,
  targetThread: threadId,
  label: label
});

export const removeThreadsLabel = (threadId, label) => ({
  type: Thread.REMOVE_THREADS_LABEL,
  threadsIds: threadId,
  label: label
});

export const removeThread = threadId => ({
  type: Thread.REMOVE,
  targetThread: threadId
});

export const removeThreads = threadsIds => ({
  type: Thread.REMOVE_THREADS,
  targetThreads: threadsIds
});

export const deselectThreads = spread => ({
  type: Thread.DESELECT_THREADS,
  spread
});

export const selectThreads = () => ({
  type: Thread.SELECT_THREADS
});

export const moveThreads = (threadsIds, label) => ({
  label,
  threadsIds,
  type: Thread.MOVE_THREADS
});

export const markThreadsRead = (threadsIds, read) => ({
  threadsIds,
  read,
  type: Thread.READ_THREADS
});

export const searchThreads = params => {
  return async dispatch => {
    dispatch({
      type: General.CHANGE_MAILBOX,
      mailbox: 'Search'
    });
    try {
      await storeValue(params.text);
      const threads = await getThreadsFilter(params);
      dispatch(addThreads(threads, true));
    } catch (e) {
      /* TO DO display message about the error and a link/button to execute a fix. The most posible error is the corruption of the data, 
        the request should not fail because of a bad query built or a non existing column/relation. Its fix should be a restore of
        the db using a backup previously made. If the backup is also corrupted for some reason, user should log out.*/
    }
  };
};

export const muteNotifications = threadId => {
  return {
    type: Thread.MUTE,
    targetThread: threadId
  };
};

export const loadThreads = params => {
  return async dispatch => {
    if (params.mailbox && params.clear) {
      dispatch({
        type: General.CHANGE_MAILBOX,
        mailbox: params.mailbox
      });
    }
    try {
      const threads = await getThreadsFilter(params);
      dispatch(addThreads(threads, params.clear));
    } catch (e) {
      /* TO DO display message about the error and a link/button to execute a fix. The most posible error is the corruption of the data, 
        the request should not fail because of a bad query built or a non existing column/relation. Its fix should be a restore of
        the db using a backup previously made. If the backup is also corrupted for some reason, user should log out.*/
    }
  };
};
