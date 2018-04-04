import { Thread } from './types';
import {
  createEmailLabel,
  deleteEmailLabel,
  getEmailsByThreadId,
  getEmailsGroupByThreadByParams,
  getEvents
} from '../utils/electronInterface';
import { storeValue } from '../utils/storage';
import { hanldeNewMessageEvent } from './../utils/electronEventInterface';

export const addThreads = (threads, clear) => ({
  type: Thread.ADD_BATCH,
  threads: threads,
  clear: clear
});

export const selectThread = threadId => ({
  type: Thread.SELECT,
  threadId: threadId
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

export const addThreadLabelSuccess = (threadId, label) => ({
  type: Thread.ADD_THREAD_LABEL,
  targetThread: threadId,
  label: label
});

export const addThreadsLabelSuccess = (threadId, label) => ({
  type: Thread.ADD_THREADS_LABEL,
  threadsIds: threadId,
  label: label
});

export const removeThreadLabelSuccess = (threadId, label) => ({
  type: Thread.REMOVE_LABEL,
  targetThread: threadId,
  label: label
});

export const removeThreadsLabelSuccess = (threadId, label) => ({
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
    try {
      await storeValue(params.text);
      const threads = await getEmailsGroupByThreadByParams(params);
      dispatch(addThreads(threads, true));
    } catch (e) {
      /* TO DO display message about the error and a link/button to execute a fix. The most posible error is the corruption of the data, 
        the request should not fail because of a bad query built or a non existing column/relation. Its fix should be a restore of
        the db using a backup previously made. If the backup is also corrupted for some reason, user should log out.*/
    }
  };
};

export const loadThreads = params => {
  return async dispatch => {
    try {
      const threads = await getEmailsGroupByThreadByParams(params);
      dispatch(addThreads(threads, params.clear));
    } catch (e) {
      /* TO DO display message about the error and a link/button to execute a fix. The most posible error is the corruption of the data, 
        the request should not fail because of a bad query built or a non existing column/relation. Its fix should be a restore of
        the db using a backup previously made. If the backup is also corrupted for some reason, user should log out.*/
    }
  };
};

export const loadEvents = () => {
  return async dispatch => {
    try {
      const receivedEvents = await getEvents();
      const events = receivedEvents.filter(item => item.cmd === 1);
      await Promise.all(
        events.map(async item => await hanldeNewMessageEvent(item.params))
      );
      dispatch(loadThreads({ clear: true }));
    } catch (e) {
      // TO DO
    }
  };
};

export const addThreadLabel = (threadParams, labelId) => {
  return async dispatch => {
    try {
      const { threadIdStore, threadIdDB } = threadParams;
      const emails = await getEmailsByThreadId(threadIdDB);
      const params = formAddThreadLabelParams(emails, labelId);
      const dbResponse = await createEmailLabel(params);
      if (dbResponse) {
        dispatch(addThreadLabelSuccess(threadIdStore, labelId));
      }
    } catch (e) {
      // TO DO
    }
  };
};

export const removeThreadLabel = (threadParams, labelId) => {
  return async dispatch => {
    try {
      const { threadIdStore, threadIdDB } = threadParams;
      const emails = await getEmailsByThreadId(threadIdDB);
      const params = formRemoveThreadLabelParams(emails, labelId);
      const dbResponse = await deleteEmailLabel(params);
      if (dbResponse) {
        dispatch(removeThreadLabelSuccess(threadIdStore, labelId));
      }
    } catch (e) {
      // TO DO
    }
  };
};

const formAddThreadLabelParams = (emails, labelId) => {
  return emails.map(email => {
    return {
      emailId: email.id,
      labelId
    };
  });
};

const formRemoveThreadLabelParams = (emails, labelId) => {
  return {
    emailsId: emails.map(email => email.id),
    labelId
  };
};

export const addThreadsLabel = (threadsParams, labelId) => {
  return async dispatch => {
    try {
      const storeIds = threadsParams.map(param => param.threadIdStore);
      const threadIds = threadsParams.map(param => param.threadIdDB);
      const dbReponse = await Promise.all(
        threadIds.map(async threadId => {
          const threadEmails = await getEmailsByThreadId(threadId);
          const params = formAddThreadLabelParams(threadEmails, labelId);
          return await createEmailLabel(params);
        })
      );
      if (dbReponse) {
        dispatch(addThreadsLabelSuccess(storeIds, labelId));
      }
    } catch (e) {
      // TO DO
    }
  };
};

export const removeThreadsLabel = (threadsParams, labelId) => {
  return async dispatch => {
    try {
      const storeIds = threadsParams.map(param => param.threadIdStore);
      const threadIds = threadsParams.map(param => param.threadIdDB);
      const dbReponse = await Promise.all(
        threadIds.map(async threadId => {
          const emails = await getEmailsByThreadId(threadId);
          const params = formRemoveThreadLabelParams(emails, labelId);
          return await deleteEmailLabel(params);
        })
      );
      if (dbReponse) {
        dispatch(removeThreadsLabelSuccess(storeIds, labelId));
      }
    } catch (e) {
      // TO DO
    }
  };
};
