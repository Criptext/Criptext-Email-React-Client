import { Thread } from './types';
import { startLoadSync, stopLoadSync } from './activity';
import { updateLabelSuccess } from './labels';
import {
  createEmailLabel,
  deleteEmailLabel,
  deleteEmailsByThreadId,
  getEmailsByThreadId,
  getEmailsGroupByThreadByParams,
  getEvents,
  updateUnreadEmailByThreadId,
  deleteEmailsByIds,
  postOpenEvent,
  getUnreadEmailsByThreadId
} from '../utils/electronInterface';
import { storeValue } from './../utils/storage';
import {
  handleNewMessageEvent,
  handleEmailTrackingUpdate
} from './../utils/electronEventInterface';
import { SocketCommand } from './../utils/const';

export const addThreads = (threads, clear) => ({
  type: Thread.ADD_BATCH,
  threads: threads,
  clear: clear
});

export const addMoveThreadsLabel = (threadsParams, labelId) => {
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
        dispatch(moveThreads(storeIds, labelId));
      }
    } catch (e) {
      // TO DO
    }
  };
};

export const selectThread = threadId => ({
  type: Thread.SELECT,
  threadId: threadId
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

export const addThreadsLabelSuccess = (threadIds, label) => ({
  type: Thread.ADD_THREADS_LABEL,
  threadIds,
  label
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

export const removeThreadsOnSuccess = threadsIds => ({
  type: Thread.REMOVE_THREADS,
  threadsIds
});

export const deselectThreads = spread => ({
  type: Thread.DESELECT_THREADS,
  spread
});

export const selectThreads = () => ({
  type: Thread.SELECT_THREADS
});

export const moveThreads = (threadIds, labelId) => ({
  type: Thread.MOVE_THREADS,
  threadIds,
  labelId
});

export const updateUnreadThread = thread => {
  return {
    type: Thread.UPDATE_UNREAD_THREAD,
    thread
  };
};

export const updateUnreadThreadsSuccess = (threadsIds, read) => ({
  threadsIds,
  read,
  type: Thread.UPDATE_UNREAD_THREADS
});

export const updateUnreadThreads = (threadsParams, read, label) => {
  return async dispatch => {
    try {
      const storeIds = threadsParams.map(param => param.threadIdStore);
      const threadIds = threadsParams.map(param => param.threadIdDB);
      const dbReponse = await Promise.all(
        threadIds.map(async threadId => {
          return await updateUnreadEmailByThreadId(threadId, !read);
        })
      );
      if (dbReponse) {
        dispatch(updateUnreadThreadsSuccess(storeIds, read));
        if (label) dispatch(updateLabelSuccess(label));
      }
    } catch (e) {
      // To do
    }
  };
};

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

export const loadEvents = params => {
  return async dispatch => {
    dispatch(startLoadSync());
    try {
      const receivedEvents = await getEvents();
      const managedEvents = receivedEvents.map(newEvent => {
        switch (newEvent.cmd) {
          case SocketCommand.NEW_EMAIL: {
            return handleNewMessageEvent(newEvent);
          }
          case SocketCommand.EMAIL_TRACKING_UPDATE: {
            return handleEmailTrackingUpdate(newEvent);
          }
          default:
            return Promise.reject('Unhandled socket command');
        }
      });
      await Promise.all(managedEvents);
      dispatch(loadThreads(params));
    } catch (e) {
      // TO DO
    }
    dispatch(stopLoadSync());
  };
};

export const removeThreads = (threadsParams, isDraft) => {
  return async dispatch => {
    try {
      const storeIds = threadsParams.map(param => param.threadIdStore);
      const threadIds = threadsParams.map(param => param.threadIdDB);

      const dbResponse = isDraft
        ? await deleteEmailsByIds(storeIds)
        : await deleteEmailsByThreadId(threadIds);
      if (dbResponse) {
        dispatch(removeThreadsOnSuccess(storeIds));
      }
    } catch (e) {
      /* TO DO display message about the error and a link/button to execute a fix. The most posible error is the corruption of the data, 
        the request should not fail because of a bad query built or a non existing column/relation. Its fix should be a restore of
        the db using a backup previously made. If the backup is also corrupted for some reason, user should log out.*/
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

export const sendOpenEvent = threadId => {
  return async () => {
    try {
      const unreadEmails = await getUnreadEmailsByThreadId(threadId);
      if (unreadEmails.length > 0) {
        const metadataKeys = unreadEmails.map(item => Number(item.key));
        const params = { metadataKeys };
        await postOpenEvent(params);
      }
    } catch (e) {
      // TO DO
    }
  };
};
