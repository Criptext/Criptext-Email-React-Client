import { Thread } from './types';
import { startLoadSync, stopLoadSync, stopLoadThread } from './activity';
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
  postOpenEvent,
  postPeerEvent,
  updateEmails,
  updateUnreadEmailByThreadIds
} from '../utils/ipc';
import { storeValue } from './../utils/storage';
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

export const addThreads = (threads, clear) => ({
  type: Thread.ADD_BATCH,
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
  currentLabelId,
  notMove
}) => {
  return async dispatch => {
    try {
      const threadIds = threadsParams
        .map(param => param.threadIdDB)
        .filter(item => item !== null);
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
        if (!notMove) {
          dispatch(moveThreads(threadIds, labelIdToAdd));
        }
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
    const shoulLoadMoreThreads = checked
      ? currentUnreadThreadsLength < LIMIT_UNREAD_THREADS
      : true;
    try {
      if (shoulLoadMoreThreads) {
        const threads = await getEmailsGroupByThreadByParams(loadParams);
        if (threads.length || !loadParams.date) {
          dispatch(addThreads(threads, loadParams.clear));
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
  emailIdsToRemove
}) => ({
  type: Thread.UPDATE_EMAILIDS_THREAD,
  threadId,
  emailIdToAdd,
  emailIdsToRemove
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
      const threadIds = threadsParams.map(param => param.threadIdDB);
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
      const expiredDeletedEmails = await getTrashExpiredEmails();
      if (expiredDeletedEmails.length) {
        dispatch(removeEmails(expiredDeletedEmails));
      }

      const threads = await getEmailsGroupByThreadByParams(params);
      if (threads.length || !params.date) {
        dispatch(addThreads(threads, params.clear));
      }
      dispatch(stopLoadThread());
    } catch (e) {
      sendFetchEmailsErrorMessage();
    }
  };
};

export const loadEvents = () => {
  return async dispatch => {
    dispatch(startLoadSync());
    await getGroupEvents();
    dispatch(stopLoadSync());
  };
};

export const sendOpenEvent = (
  emailKeysUnread,
  myEmailKeysUnread,
  threadId,
  labelId
) => {
  return async dispatch => {
    try {
      let postSuccess = true;
      if (emailKeysUnread.length) {
        const { status } = await postOpenEvent(emailKeysUnread.map(Number));
        if (status === 200) {
          await updateEmails({
            keys: emailKeysUnread,
            unread: false
          });
        } else {
          postSuccess = false;
        }
      }

      if (myEmailKeysUnread.length && postSuccess) {
        const eventParams = {
          cmd: SocketCommand.PEER_EMAIL_READ_UPDATE,
          params: { metadataKeys: myEmailKeysUnread.map(Number), unread: 0 }
        };
        const { status } = await postPeerEvent(eventParams);
        if (status === 200) {
          const response = await updateEmails({
            keys: myEmailKeysUnread,
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
