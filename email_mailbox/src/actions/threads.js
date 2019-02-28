import { Thread } from './types';
import { addDataApp, startLoadSync, stopLoadThread } from './index';
import { updateBadgeLabels } from './labels';
import { LabelType } from '../utils/electronInterface';
import {
  createEmailLabel,
  deleteEmailLabel,
  deleteEmailsByIds,
  deleteEmailsByThreadIdAndLabelId,
  getEmailsByThreadId,
  getEmailsByThreadIdAndLabelId,
  getEmailsGroupByThreadByParams,
  getLabelById,
  getTrashExpiredEmails,
  postPeerEvent,
  updateEmails,
  updateUnreadEmailByThreadIds
} from '../utils/ipc';
import {
  getGroupEvents,
  sendFetchEmailsErrorMessage,
  sendOpenEventErrorMessage,
  sendRemoveThreadsErrorMessage,
  sendUpdateThreadLabelsErrorMessage,
  sendUpdateUnreadThreadsErrorMessage
} from './../utils/electronEventInterface';
import { loadFeedItems } from './feeditems';
import { SocketCommand } from '../utils/const';
import { removeEmails } from './emails';
import { filterTemporalThreadIds } from '../utils/EmailUtils';
import { defineThreads } from '../utils/ThreadUtils';
import { addContacts } from '.';

export const addThreads = (labelId, threads, clear) => ({
  type: Thread.ADD_BATCH,
  labelId: labelId,
  threads: threads,
  clear: clear
});

export const addLabelIdThread = (threadId, labelId) => {
  return async dispatch => {
    try {
      const [label] = await getLabelById(labelId);
      const threadIds = filterTemporalThreadIds([threadId]);
      if (threadIds.length) {
        const eventParams = {
          cmd: SocketCommand.PEER_THREAD_LABELS_UPDATE,
          params: {
            threadIds: [threadId],
            labelsRemoved: [],
            labelsAdded: [label.text]
          }
        };
        await postPeerEvent(eventParams);
        const emails = await getEmailsByThreadId(threadId);
        const params = formAddThreadLabelParams(emails, labelId);
        const dbResponse = await createEmailLabel(params);
        if (dbResponse) {
          dispatch(addLabelIdThreadSuccess(threadId, labelId));
        }
      }
    } catch (e) {
      sendUpdateThreadLabelsErrorMessage();
    }
  };
};

export const addLabelIdThreadSuccess = (threadId, labelId) => ({
  type: Thread.ADD_LABELID_THREAD,
  threadId,
  labelId
});

export const addLabelIdThreadDraft = (uniqueId, labelId) => {
  return async dispatch => {
    try {
      const emailId = uniqueId;
      const response = await createEmailLabel([{ emailId, labelId }]);
      if (response) {
        dispatch(addLabelIdThreadDraftSuccess(uniqueId, labelId));
      } else {
        sendUpdateThreadLabelsErrorMessage();
      }
    } catch (e) {
      sendUpdateThreadLabelsErrorMessage();
    }
  };
};

export const addLabelIdThreadDraftSuccess = (uniqueId, labelId) => {
  return {
    type: Thread.ADD_LABELID_THREAD_DRAFT,
    uniqueId,
    labelId
  };
};

export const addLabelIdThreads = (threadsParams, labelId) => {
  return async dispatch => {
    try {
      const threadIds = threadsParams.map(param => param.threadIdDB);
      const [label] = await getLabelById(labelId);
      const eventParams = {
        cmd: SocketCommand.PEER_THREAD_LABELS_UPDATE,
        params: {
          threadIds: filterTemporalThreadIds(threadIds),
          labelsRemoved: [],
          labelsAdded: [label.text]
        }
      };
      if (eventParams.params.threadIds.length) {
        await postPeerEvent(eventParams);
      }
      const dbReponse = await Promise.all(
        threadIds.map(async threadId => {
          const threadEmails = await getEmailsByThreadId(threadId);
          const params = formAddThreadLabelParams(threadEmails, labelId);
          return await createEmailLabel(params);
        })
      );
      if (dbReponse) {
        dispatch(addLabelIdThreadsSuccess(threadIds, labelId));
      }
    } catch (e) {
      sendUpdateThreadLabelsErrorMessage();
    }
  };
};

export const addLabelIdThreadsSuccess = (threadIds, labelId) => ({
  type: Thread.ADD_LABELID_THREADS,
  threadIds,
  labelId
});

export const addMoveLabelIdThreads = ({
  threadsParams,
  labelIdToAdd,
  labelIdToRemove,
  currentLabelId
}) => {
  return async dispatch => {
    try {
      const threadIds = threadsParams
        .map(param => param.threadIdDB)
        .filter(item => item !== null);
      if (!threadIds.length) return;

      const [labeltoAdd] = await getLabelById(labelIdToAdd);
      const labelsAdded = [labeltoAdd.text];
      const [labeltoRemove] = labelIdToRemove
        ? await getLabelById(labelIdToRemove)
        : [undefined];
      const labelsRemoved = labeltoRemove ? [labeltoRemove.text] : [];
      const eventParams = {
        cmd: SocketCommand.PEER_THREAD_LABELS_UPDATE,
        params: {
          threadIds: filterTemporalThreadIds(threadIds),
          labelsRemoved,
          labelsAdded
        }
      };
      if (eventParams.params.threadIds.length) {
        await postPeerEvent(eventParams);
      }

      const dbReponse = await Promise.all(
        threadIds.map(async threadId => {
          const threadEmails = await getEmailsByThreadId(threadId);
          if (labelIdToRemove) {
            const paramsToRemove = formRemoveThreadLabelParams(
              threadEmails,
              labelIdToRemove
            );
            await deleteEmailLabel(paramsToRemove);
          }
          const paramsToAdd = formAddThreadLabelParams(
            threadEmails,
            labelIdToAdd
          );
          return await createEmailLabel(paramsToAdd);
        })
      );
      if (dbReponse) {
        let labelIds = [];
        if (
          currentLabelId === LabelType.inbox.id &&
          (labelIdToAdd === LabelType.trash.id ||
            labelIdToAdd === LabelType.spam.id)
        )
          labelIds = [...labelIds, currentLabelId];
        if (labelIdToAdd === LabelType.spam.id)
          labelIds = [...labelIds, labelIdToAdd];
        if (labelIds.length) dispatch(updateBadgeLabels(labelIds));
        dispatch(moveThreads(threadIds, labelIdToAdd));
      }
    } catch (e) {
      sendUpdateThreadLabelsErrorMessage();
    }
  };
};

const filterThreadsByUnread = checked => ({
  type: Thread.UNREAD_FILTER,
  enabled: checked
});

export const filterThreadsOrLoadMoreByUnread = (
  checked,
  currentUnreadThreadsLength,
  loadParams
) => {
  return async dispatch => {
    const LIMIT_UNREAD_THREADS = 20;
    const shouldLoadMoreThreads = checked
      ? currentUnreadThreadsLength < LIMIT_UNREAD_THREADS
      : true;
    try {
      if (shouldLoadMoreThreads) {
        const threads = await getEmailsGroupByThreadByParams(loadParams);
        if (threads.length || !loadParams.date) {
          dispatch(addThreads(loadParams.labelId, threads, loadParams.clear));
        }
      }
      dispatch(filterThreadsByUnread(checked));
      dispatch(stopLoadThread());
    } catch (e) {
      sendFetchEmailsErrorMessage();
    }
  };
};

export const moveThreads = (threadIds, labelId) => ({
  type: Thread.MOVE_THREADS,
  threadIds,
  labelId
});

export const removeLabelIdThread = (threadId, labelId) => {
  return async dispatch => {
    try {
      const [label] = await getLabelById(labelId);
      const threadIds = filterTemporalThreadIds([threadId]);
      if (threadIds.length) {
        const eventParams = {
          cmd: SocketCommand.PEER_THREAD_LABELS_UPDATE,
          params: {
            threadIds: [threadId],
            labelsRemoved: [label.text],
            labelsAdded: []
          }
        };
        await postPeerEvent(eventParams);
        const emails = await getEmailsByThreadId(threadId);
        const params = formRemoveThreadLabelParams(emails, labelId);
        const dbResponse = await deleteEmailLabel(params);
        if (dbResponse) {
          dispatch(removeLabelIdThreadSuccess(threadId, labelId));
        }
      }
    } catch (e) {
      sendUpdateThreadLabelsErrorMessage();
    }
  };
};

export const removeLabelIdThreadSuccess = (threadId, labelId) => ({
  type: Thread.REMOVE_LABELID_THREAD,
  threadId,
  labelId
});

export const removeLabelIdThreadDraft = (uniqueId, labelId) => {
  return async dispatch => {
    try {
      const emailId = uniqueId;
      const response = await deleteEmailLabel([{ emailId, labelId }]);
      if (response) {
        dispatch(removeLabelIdThreadDraftSuccess(uniqueId, labelId));
      } else {
        sendUpdateThreadLabelsErrorMessage();
      }
    } catch (e) {
      sendUpdateThreadLabelsErrorMessage();
    }
  };
};

export const removeLabelIdThreadDraftSuccess = (uniqueId, labelId) => {
  return {
    type: Thread.REMOVE_LABELID_THREAD_DRAFT,
    uniqueId,
    labelId
  };
};

export const removeLabelIdThreads = (threadsParams, labelId) => {
  return async dispatch => {
    try {
      const threadIds = threadsParams.map(param => param.threadIdDB);
      const [label] = await getLabelById(labelId);
      const eventParams = {
        cmd: SocketCommand.PEER_THREAD_LABELS_UPDATE,
        params: {
          threadIds: filterTemporalThreadIds(threadIds),
          labelsRemoved: [label.text],
          labelsAdded: []
        }
      };
      if (eventParams.params.threadIds.length) {
        await postPeerEvent(eventParams);
      }

      const dbReponse = await Promise.all(
        threadIds.map(async threadId => {
          const emails = await getEmailsByThreadId(threadId);
          const params = formRemoveThreadLabelParams(emails, labelId);
          return await deleteEmailLabel(params);
        })
      );
      if (dbReponse) {
        dispatch(removeLabelIdThreadsSuccess(threadIds, labelId));
        let labelIds = [LabelType.inbox.id];
        if (labelId === LabelType.spam.id) labelIds = [...labelIds, labelId];
        dispatch(updateBadgeLabels(labelIds));
      }
    } catch (e) {
      sendUpdateThreadLabelsErrorMessage();
    }
  };
};

export const removeLabelIdThreadsSuccess = (threadIds, labelId) => ({
  type: Thread.REMOVE_LABELID_THREADS,
  threadIds,
  labelId
});

export const removeThreads = (threadsParams, labelId) => {
  return async dispatch => {
    try {
      const threadIds = threadsParams
        .map(param => param.threadIdDB)
        .filter(item => !(item === null || item === undefined));
      const emails = await getEmailsByThreadIdAndLabelId({
        threadIds,
        labelId
      });
      if (emails.length) {
        const metadataKeys = emails.reduce((result, email) => {
          return [...result, ...email.keys];
        }, []);
        const eventParams = {
          cmd: SocketCommand.PEER_EMAIL_DELETED_PERMANENTLY,
          params: { metadataKeys }
        };
        const { status } = await postPeerEvent(eventParams);
        if (status === 200) {
          const uniqueIds = emails.map(email => email.threadId);
          await deleteEmailsByThreadIdAndLabelId({ threadIds, labelId });
          dispatch(removeThreadsSuccess(uniqueIds));
        } else {
          sendRemoveThreadsErrorMessage();
        }
      }
      if (labelId === LabelType.spam.id) {
        dispatch(updateBadgeLabels([labelId]));
      }
      dispatch(loadFeedItems(true));
    } catch (e) {
      sendRemoveThreadsErrorMessage();
    }
  };
};

export const removeThreadsSuccess = uniqueIds => ({
  type: Thread.REMOVE_THREADS,
  uniqueIds
});

export const removeThreadsDrafts = draftsParams => {
  return async dispatch => {
    try {
      const threadIdsDB = draftsParams
        .map(draft => draft.threadIdDB)
        .filter(item => !!item);
      const emailIds = draftsParams
        .map(draft => draft.emailId)
        .filter(item => !!item);
      const draftLabelId = LabelType.draft.id;
      if (threadIdsDB.length) {
        await deleteEmailsByThreadIdAndLabelId({
          threadIds: threadIdsDB,
          labelId: draftLabelId
        });
      }
      if (emailIds.length) {
        await deleteEmailsByIds(emailIds);
      }
      const uniqueIds = [...threadIdsDB, ...emailIds];
      dispatch(removeThreadsSuccess(uniqueIds));
      dispatch(updateBadgeLabels([draftLabelId]));
    } catch (e) {
      sendRemoveThreadsErrorMessage();
    }
  };
};

export const updateEmailIdsThread = ({
  threadId,
  emailIdToAdd,
  emailIdsToRemove,
  emailIds
}) => ({
  type: Thread.UPDATE_EMAILIDS_THREAD,
  threadId,
  emailIdToAdd,
  emailIdsToRemove,
  emailIds
});

export const updateStatusThread = (threadId, status) => ({
  type: Thread.UPDATE_STATUS_THREAD,
  threadId,
  status
});

export const updateUnreadThreadsSuccess = (threadIds, unread) => ({
  threadIds,
  unread,
  type: Thread.UPDATE_UNREAD_THREADS
});

export const updateUnreadThreads = (threadsParams, unread, labelId) => {
  return async dispatch => {
    try {
      const threadIds = threadsParams
        .map(param => param.threadIdDB)
        .filter(item => item !== null);
      if (!threadIds.length) return;

      const eventParams = {
        cmd: SocketCommand.PEER_THREAD_READ_UPDATE,
        params: { threadIds, unread: unread ? 1 : 0 }
      };
      const { status } = await postPeerEvent(eventParams);
      if (status === 200) {
        const response = await updateUnreadEmailByThreadIds({
          threadIds,
          unread
        });
        if (response) {
          dispatch(updateUnreadThreadsSuccess(threadIds, unread));
          if (labelId === LabelType.inbox.id || labelId === LabelType.spam.id)
            dispatch(updateBadgeLabels([labelId]));
        }
      }
    } catch (e) {
      sendUpdateUnreadThreadsErrorMessage();
    }
  };
};

export const loadThreads = params => {
  return async dispatch => {
    try {
      if (LabelType.trash.id === params.labelId) {
        const expiredDeletedEmails = await getTrashExpiredEmails();
        if (expiredDeletedEmails.length) {
          dispatch(removeEmails(expiredDeletedEmails));
        }
      }
      const { threads, contacts } = await defineThreads(params);
      const contact = contacts ? addContacts(contacts) : undefined;
      const thread =
        threads.length || !params.date
          ? addThreads(params.labelId, threads, params.clear)
          : undefined;
      const activity = stopLoadThread();
      dispatch(addDataApp({ activity, contact, thread }));
    } catch (e) {
      sendFetchEmailsErrorMessage();
    }
  };
};

export const loadEvents = ({ showNotification }) => {
  return async dispatch => {
    dispatch(startLoadSync());
    await getGroupEvents({ showNotification });
  };
};

export const sendOpenEvent = (emailKeysUnread, threadId, labelId) => {
  return async dispatch => {
    try {
      if (emailKeysUnread.length) {
        const metadataKeys = emailKeysUnread.map(Number);
        const eventParams = {
          cmd: SocketCommand.SEND_OPEN_EVENT,
          params: { metadataKeys }
        };
        const { status } = await postPeerEvent(eventParams);
        if (status === 200) {
          const response = await updateEmails({
            keys: metadataKeys,
            unread: false
          });
          if (response) {
            dispatch(updateUnreadThreadsSuccess([threadId], false));
          }
        }
      }
      if (labelId > 0) dispatch(updateBadgeLabels([labelId]));
    } catch (e) {
      sendOpenEventErrorMessage();
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
    labelIds: [labelId]
  };
};
