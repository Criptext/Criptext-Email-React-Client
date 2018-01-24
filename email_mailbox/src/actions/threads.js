import { Thread } from './types';
import { getThreads } from '../utils/electronInterface';

export const addThreads = threads => ({
  type: Thread.ADD_BATCH,
  threads: threads.sort((t1, t2) => {
    return t1.lastEmailDate <= t2.lastEmailDate;
  })
});

export const selectThread = threadId => ({
  type: Thread.SELECT,
  selectedThread: threadId
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

export const searchThreads = params => ({
  params,
  type: Thread.SEARCH_THREADS
});

export const muteNotifications = threadId => {
  return {
    type: Thread.MUTE,
    targetThread: threadId
  };
};

export const loadThreads = timestamp => {
  return async dispatch => {
    try {
      const threads = await getThreads(timestamp);
      dispatch(addThreads(threads));
    } catch (e) {
      // TO DO
    }
  };
};
