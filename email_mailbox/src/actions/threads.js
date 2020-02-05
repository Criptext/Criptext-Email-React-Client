import { Thread } from './types';
import {
  addDataApp,
  addContacts,
  addEmails,
  addEmailLabels,
  addFiles,
  removeEmailLabels,
  loadFeedItems,
  removeEmails,
  startLoadSync,
  stopLoadThread,
  stopAll,
  updateEmailsSuccess,
  updateSwitchThreads
} from './index';
import { updateBadgeLabels } from './labels';
import { _loadEmails } from './emails';
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
import { SocketCommand } from '../utils/const';
import { filterTemporalThreadIds } from '../utils/EmailUtils';
import { defineThreads } from '../utils/ThreadUtils';
import { defineFiles } from '../utils/FileUtils';

export const addThreads = (labelId, threads, clear) => ({
  type: Thread.ADD_BATCH,
  labelId: labelId,
  threads: threads,
  clear: clear
});

const returnEmailIdsFromThreadsIds = async (threadIds, labelId) => {
  const emails = await Promise.all(
    threadIds.map(async threadId => {
      const emailsOfThread = await getEmailsByThreadId(threadId);

      return emailsOfThread.filter(mail => {
        if (!mail.labelIds) return false;
        return typeof mail.labelIds === 'string'
          ? mail.labelIds
              .split(',')
              .map(Number)
              .includes(labelId)
          : mail.labelIds.includes(labelId);
      });
    })
  );
  return emails.flat();
};

export const addLabelIdThread = (currentLabelId, threadId, labelId) => {
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
      }
      const emails = await getEmailsByThreadId(threadId);
      const params = formAddThreadLabelParams(emails, labelId);
      const dbResponse = await createEmailLabel(params);
      if (dbResponse) {
        dispatch(addLabelIdThreadSuccess(currentLabelId, threadId, labelId));
      }
    } catch (e) {
      sendUpdateThreadLabelsErrorMessage();
    }
  };
};

export const addLabelIdThreadSuccess = (labelId, threadId, labelIdToAdd) => ({
  type: Thread.ADD_LABELID_THREAD,
  labelId,
  threadId,
  labelIdToAdd
});

export const addLabelIdThreadDraft = (currentLabelId, uniqueId, labelId) => {
  return async dispatch => {
    try {
      const emailId = uniqueId;
      const response = await createEmailLabel([{ emailId, labelId }]);
      if (response) {
        dispatch(addLabelIdThreadSuccess(currentLabelId, uniqueId, labelId));
      } else {
        sendUpdateThreadLabelsErrorMessage();
      }
    } catch (e) {
      sendUpdateThreadLabelsErrorMessage();
    }
  };
};

export const addLabelIdThreads = (currentLabelId, threadsParams, labelId) => {
  return async dispatch => {
    try {
      const { threadIds, uniqueIds } = threadsParams.reduce(
        (result, item) => {
          let threadIds = [];
          if (item.threadIdDB) {
            threadIds = [...result.threadIds, item.threadIdDB];
          }
          const uniqueIds = [
            ...result.uniqueIds,
            item.threadIdDB || item.emailId
          ];
          return { ...result, threadIds, uniqueIds };
        },
        { threadIds: [], uniqueIds: [] }
      );

      const [label] = await getLabelById(labelId);
      if (threadIds) {
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
      }

      const dbReponse = await Promise.all(
        threadsParams.map(async uniqueId => {
          let params = [];
          if (uniqueId.threadIdDB) {
            const emails = await getEmailsByThreadId(uniqueId.threadIdDB);
            params = formAddThreadLabelParams(emails, labelId);
          } else {
            params = [
              {
                emailId: uniqueId.emailId,
                labelId
              }
            ];
          }
          return await createEmailLabel(params);
        })
      );

      if (dbReponse) {
        dispatch(addLabelIdThreadsSuccess(currentLabelId, uniqueIds, labelId));
      }
    } catch (e) {
      sendUpdateThreadLabelsErrorMessage();
    }
  };
};

export const addLabelIdThreadsSuccess = (labelId, uniqueIds, labelIdToAdd) => ({
  type: Thread.ADD_LABELID_THREADS,
  labelId,
  threadIds: uniqueIds,
  labelIdToAdd
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
        dispatch(moveThreads(currentLabelId, threadIds));

        const emails = await returnEmailIdsFromThreadsIds(
          threadIds,
          labelIdToAdd
        );

        dispatch(addEmailLabels(emails, [labelIdToAdd]));
      }
    } catch (e) {
      sendUpdateThreadLabelsErrorMessage();
    }
  };
};

export const removeAllThreads = labelId => ({
  type: Thread.REMOVE_ALL_THREADS,
  labelId: labelId
});

export const filterThreadsOrLoadMoreByUnread = (
  checked,
  currentUnreadThreadsLength,
  loadParams
) => {
  return async dispatch => {
    const LIMIT_UNREAD_THREADS = 22;
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
      dispatch(updateSwitchThreads({ checked: null, disabled: false }));
      dispatch(stopLoadThread());
    } catch (e) {
      dispatch(updateSwitchThreads({ checked: !checked, disabled: false }));
      sendFetchEmailsErrorMessage();
    }
  };
};

export const moveThreads = (labelId, threadIds, labelIdToAdd) => ({
  type: Thread.MOVE_THREADS,
  labelId,
  threadIds,
  labelIdToAdd
});

export const removeLabelIdThread = (currentLabelId, threadId, labelId) => {
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
      }
      const emails = await getEmailsByThreadId(threadId);
      const params = formRemoveThreadLabelParams(emails, labelId);
      const dbResponse = await deleteEmailLabel(params);
      if (dbResponse) {
        dispatch(removeLabelIdThreadSuccess(currentLabelId, threadId, labelId));
        const emails = await getEmailsByThreadId(threadId);
        dispatch(removeEmailLabels(emails, [labelId]));
      }
    } catch (e) {
      sendUpdateThreadLabelsErrorMessage();
    }
  };
};

export const removeLabelIdThreadSuccess = (
  labelId,
  uniqueId,
  labelIdToRemove
) => ({
  type: Thread.REMOVE_LABELID_THREAD,
  labelId,
  uniqueId,
  labelIdToRemove
});

export const removeLabelIdThreadDraft = (currentLabelId, uniqueId, labelId) => {
  return async dispatch => {
    try {
      const emailId = uniqueId;
      const response = await deleteEmailLabel([{ emailId, labelId }]);
      if (response) {
        dispatch(removeLabelIdThreadSuccess(currentLabelId, uniqueId, labelId));
      } else {
        sendUpdateThreadLabelsErrorMessage();
      }
    } catch (e) {
      sendUpdateThreadLabelsErrorMessage();
    }
  };
};

export const removeLabelIdThreads = (
  currentLabelId,
  threadsParams,
  labelIdToRemove
) => {
  return async dispatch => {
    try {
      const threadIds = threadsParams.map(param => param.threadIdDB);
      const [label] = await getLabelById(labelIdToRemove);
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

      const emails = await returnEmailIdsFromThreadsIds(
        threadIds,
        labelIdToRemove
      );
      const dbReponse = await Promise.all(
        threadIds.map(async threadId => {
          const emails = await getEmailsByThreadId(threadId);
          const params = formRemoveThreadLabelParams(emails, labelIdToRemove);
          return await deleteEmailLabel(params);
        })
      );
      if (!dbReponse) return;
      dispatch(
        removeLabelIdThreadsSuccess(currentLabelId, threadIds, labelIdToRemove)
      );
      const labelsToRemove =
        currentLabelId === LabelType.spam.id
          ? [LabelType.spam.id, LabelType.trash.id]
          : [labelIdToRemove];
      dispatch(removeEmailLabels(emails, labelsToRemove));
      let labelToUpdateBadge =
        labelIdToRemove === LabelType.inbox ? LabelType.inbox.id : null;
      labelToUpdateBadge =
        labelIdToRemove === LabelType.spam.id
          ? LabelType.spam.id
          : labelIdToRemove;
      if (labelToUpdateBadge) dispatch(updateBadgeLabels([LabelType.inbox.id]));
      if (labelIdToRemove !== currentLabelId) return;
      dispatch(moveThreads(currentLabelId, threadIds));
    } catch (e) {
      sendUpdateThreadLabelsErrorMessage();
    }
  };
};

export const removeLabelIdThreadsSuccess = (
  labelId,
  threadIds,
  labelIdToRemove
) => ({
  type: Thread.REMOVE_LABELID_THREADS,
  labelId,
  threadIds,
  labelIdToRemove
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
          dispatch(removeThreadsSuccess(labelId, uniqueIds));
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

export const removeThreadsSuccess = (labelId, uniqueIds) => ({
  type: Thread.REMOVE_THREADS,
  labelId,
  uniqueIds
});

export const removeThreadsDrafts = (labelId, draftsParams) => {
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
      dispatch(removeThreadsSuccess(labelId, uniqueIds));
      dispatch(updateBadgeLabels([draftLabelId]));
    } catch (e) {
      sendRemoveThreadsErrorMessage();
    }
  };
};

export const updateEmailIdsThread = ({
  labelId,
  threadId,
  emailIdToAdd,
  emailIdsToRemove,
  emailIds
}) => ({
  type: Thread.UPDATE_EMAILIDS_THREAD,
  labelId,
  threadId,
  emailIdToAdd,
  emailIdsToRemove,
  emailIds
});

export const updateThread = ({ labelId, threadId, status }) => ({
  type: Thread.UPDATE_THREAD,
  labelId,
  threadId,
  status
});

export const updateThreadsSuccess = (labelId, threadIds, unread) => ({
  type: Thread.UPDATE_THREADS,
  labelId,
  threadIds,
  unread
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
        const [response] = await updateUnreadEmailByThreadIds({
          threadIds,
          unread
        });
        if (response) {
          dispatch(updateThreadsSuccess(labelId, threadIds, unread));
          if (labelId === LabelType.inbox.id || labelId === LabelType.spam.id)
            dispatch(updateBadgeLabels([labelId]));
        }
      }
    } catch (e) {
      sendUpdateUnreadThreadsErrorMessage();
    }
  };
};

export const loadThreads = (params, shouldStopAll) => {
  return async dispatch => {
    try {
      if (LabelType.trash.id === params.labelId) {
        const expiredDeletedEmails = await getTrashExpiredEmails();
        if (expiredDeletedEmails.length) {
          dispatch(removeEmails(LabelType.trash.id, expiredDeletedEmails));
        }
      }
      const { threads, contacts } = await defineThreads(params);
      const contact = contacts ? addContacts(contacts) : undefined;
      const thread =
        threads.length || !params.date
          ? addThreads(params.labelId, threads, params.clear)
          : undefined;
      const activity = shouldStopAll ? stopAll() : stopLoadThread();
      dispatch(addDataApp({ activity, contact, thread }));
    } catch (e) {
      sendFetchEmailsErrorMessage();
    }
  };
};

export const loadThreadsAndEmails = (params, threadId, shouldStopAll) => {
  return async dispatch => {
    try {
      if (LabelType.trash.id === params.labelId) {
        const expiredDeletedEmails = await getTrashExpiredEmails();
        if (expiredDeletedEmails.length) {
          dispatch(removeEmails(LabelType.trash.id, expiredDeletedEmails));
        }
      }
      const data = await _loadEmails({ threadId });
      const fileTokens = Array.from(data.fileTokens);
      const { threads, contacts } = await defineThreads(
        params,
        data.contactIds
      );
      const contact = contacts ? addContacts(contacts) : undefined;
      const thread =
        threads.length || !params.date
          ? addThreads(params.labelId, threads, params.clear)
          : undefined;
      const activity = shouldStopAll ? stopAll() : stopLoadThread();
      const files = await defineFiles(fileTokens);
      const file = addFiles(files);
      const email = addEmails(data.emails);
      dispatch(addDataApp({ activity, contact, thread, file, email }));
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

export const sendOpenEvent = (
  emailKeysUnread,
  emailsUnread,
  threadId,
  labelId
) => {
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
            const thread = updateThreadsSuccess(labelId, [threadId], false);
            const email = updateEmailsSuccess(emailsUnread);
            dispatch(addDataApp({ thread, email }));
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
    emailIds: emails.map(email => email.id),
    labelIds: [labelId]
  };
};
