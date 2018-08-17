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
  getUnreadEmailsByThreadId,
  postPeerEvent
} from '../utils/electronInterface';
import { storeValue } from './../utils/storage';
import { handleEvent } from './../utils/electronEventInterface';
import { loadFeedItems } from './feeditems';
import { SocketCommand } from '../utils/const';

export const addEmailIdToThread = ({ threadId, emailId }) => ({
  type: Thread.ADD_EMAILID_THREAD,
  threadId,
  emailId
});

export const addThreads = (threads, clear) => ({
  type: Thread.ADD_BATCH,
  threads: threads,
  clear: clear
});

export const addThreadLabelSuccess = (threadId, label) => ({
  type: Thread.ADD_LABEL_THREAD,
  targetThread: threadId,
  label: label
});

export const addThreadsLabelSuccess = (threadIds, label) => ({
  type: Thread.ADD_LABEL_THREADS,
  threadIds,
  label
});

export const filterThreadsByUnread = enabled => ({
  type: Thread.UNREAD_FILTER,
  enabled: enabled
});

export const moveThreads = (threadIds, labelId) => ({
  type: Thread.MOVE_THREADS,
  threadIds,
  labelId
});

export const removeEmailIdsToThread = ({ threadId, emailIds }) => ({
  type: Thread.REMOVE_EMAILID_THREAD,
  threadId,
  emailIds
});

export const removeThread = threadId => ({
  type: Thread.REMOVE_THREAD,
  targetThread: threadId
});

export const removeThreadsSuccess = threadsIds => ({
  type: Thread.REMOVE_THREADS,
  threadsIds
});

export const removeThreadLabelSuccess = (threadId, label) => ({
  type: Thread.REMOVE_LABEL_THREAD,
  targetThread: threadId,
  label: label
});

export const removeThreadsLabelSuccess = (threadId, label) => ({
  type: Thread.REMOVE_LABEL_THREADS,
  threadsIds: threadId,
  label: label
});

export const selectThread = threadId => ({
  type: Thread.SELECT,
  threadId: threadId
});

export const updateStatusThread = (threadId, status) => ({
  type: Thread.UPDATE_STATUS_THREAD,
  threadId,
  status
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

export const addMoveThreadsLabel = ({ threadsParams, labelId, notMove }) => {
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
      if (dbReponse && !notMove) {
        dispatch(moveThreads(storeIds, labelId));
      }
    } catch (e) {
      // TO DO
    }
  };
};

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
        const eventParams = {
          cmd: SocketCommand.PEER_THREAD_READ_UPDATE,
          params: { threadIds, unread: read ? 0 : 1 }
        };
        const { status } = await postPeerEvent(eventParams);
        if (status === 200) {
          dispatch(updateUnreadThreadsSuccess(storeIds, read));
          if (label) dispatch(updateLabelSuccess(label));
        }
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
      const managedEvents = receivedEvents.map(async newEvent => {
        return await handleEvent(newEvent);
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
        dispatch(removeThreadsSuccess(storeIds));
        dispatch(loadFeedItems(true));
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
        await postOpenEvent(metadataKeys);
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

export const removeThreadsByThreadIdsOnSuccess = threadIds => ({
  type: Thread.REMOVE_THREADS_BY_THREAD_ID,
  threadIds
});

export const updateUnreadThreadsByThreadIds = (threadIds, unread) => ({
  type: Thread.UPDATE_UNREAD_THREADS_BY_THREAD_ID,
  threadIds,
  unread
});
