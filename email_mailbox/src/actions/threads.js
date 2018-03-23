import { Thread } from './types';
import {
  createEmail,
  createEmailLabel,
  getEmailsGroupByThreadByParams,
  getEvents,
  deleteEmailLabel
} from '../utils/electronInterface';
import { removeAppDomain } from './../utils/StringUtils';
import signal from './../libs/signal';
import { storeValue } from '../utils/storage';
import { LabelType } from './../utils/const';

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
        events.map(async item => {
          const bodyKey = item.params.bodyKey;
          const recipientId = getRecipientIdFromEmailAddress(item.params.from);
          const deviceId = 1;
          const { content, preview } = await getContentMessage(
            bodyKey,
            recipientId,
            deviceId
          );
          const email = {
            key: item.params.metadataKey,
            threadId: item.params.threadId,
            s3Key: bodyKey,
            content,
            preview,
            subject: item.params.subject,
            date: item.params.date,
            delivered: false,
            unread: true,
            secure: true,
            isTrash: false,
            isDraft: false,
            isMuted: false
          };
          const recipients = {
            to: formRecipients(item.params.to),
            cc: formRecipients(item.params.cc),
            bcc: formRecipients(item.params.bcc),
            from: formRecipients(item.params.from)
          };
          const InboxLabel = LabelType.inbox;
          const labels = [ InboxLabel.id ];
          const params = { 
            email, 
            recipients,
            labels
          };
          const response = await createEmail(params);
          return response;
        })
      );
      dispatch(loadThreads({ clear: true }));
    } catch (e) {
      // TO DO
    }
  };
};

const getContentMessage = async (bodyKey, recipientId, deviceId) => {
  const content = await signal.decryptEmail(bodyKey, recipientId, deviceId);
  if (content === undefined) {
    return { content: '', preview: '' };
  }
  const preview = removeHTMLTags(content).slice(0, 21);
  return { content, preview };
};

const getRecipientIdFromEmailAddress = emailAddress => {
  return removeAppDomain(emailAddress);
};

const formRecipients = recipientString => {
  return recipientString === '' ? [] : recipientString.split(',');
};

// Single Thread

export const addThreadLabel = (threadParams, labelId) => {
  return async dispatch => {
    try {
      const { idThread, threadId } = threadParams;
      //const params = formThreadEmailLabel(threads, labelId);
      //await createEmailLabel(params);
      dispatch(addThreadLabelSuccess(idThread, labelId));
    } catch (e) {
      // TO DO
    }
  };
}

export const removeThreadLabel = (threadParams, labelId) => {
  return async dispatch => {
    try {
      const { idThread, threadId } = threadParams;
      //const params = formThreadEmailLabel(threads, labelId);
      //await deleteEmailLabel(params);
      dispatch(removeThreadLabelSuccess(idThread, labelId));
    } catch (e) {
      // TO DO
    }
  };
}

// Multiple Thread

export const addThreadsLabel = (threadsParams, labelId) => {
  return async dispatch => {
    try {
      const idThreads = threadsParams.map(param => param.idThread);
      const threadIds = threadsParams.map(param => param.threadId);
      //const params = formThreadEmailLabel(threads, labelId);
      //await createEmailLabel(params);
      dispatch(addThreadsLabelSuccess(idThreads, labelId));
    } catch (e) {
      // TO DO
    }
  };
}

export const removeThreadsLabel = (threadsParams, labelId) => {
  return async dispatch => {
    try {
      const idThreads = threadsParams.map(param => param.idThread);
      const threadIds = threadsParams.map(param => param.threadId);
      //const params = formThreadEmailLabel(threads, labelId);
      //await deleteEmailLabel(params);
      dispatch(removeThreadsLabelSuccess(idThreads, labelId));
    } catch (e) {
      // TO DO
    }
  };
}