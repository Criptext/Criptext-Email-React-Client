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
  updateBadgeAccounts,
  updateBadgeLabels,
  updateEmailsSuccess,
  updateSwitchThreads
} from './index';
import { _loadEmails } from './emails';
import { LabelType } from '../utils/electronInterface';
import {
  createEmailLabel,
  deleteEmailLabel,
  deleteEmailsByIds,
  deleteEmailsByThreadIdAndLabelId,
  getContactByEmails,
  getEmailsIdsByThreadIds,
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
import { modifyContactIsTrusted } from './contacts';

const PEER_BATCH = 25;

export const addThreads = (labelId, threads, clear) => ({
  type: Thread.ADD_BATCH,
  labelId: labelId,
  threads: threads,
  clear: clear
});

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
        await postPeerEvent({ data: eventParams });
      }
      const emails = await getEmailsIdsByThreadIds({ threadIds: [threadId] });
      const emailLabels = formAddThreadLabelParams(emails, labelId);
      dispatch(addLabelIdThreadSuccess(currentLabelId, threadId, labelId));
      await createEmailLabel({ emailLabels });
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
      const emailLabels = [{ emailId, labelId }];
      dispatch(addLabelIdThreadSuccess(currentLabelId, uniqueId, labelId));
      await createEmailLabel({ emailLabels });
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
      const filteredThreadIds = filterTemporalThreadIds(threadIds || []);

      let threadIdsForEvent = filteredThreadIds.splice(0, PEER_BATCH);
      while (threadIdsForEvent.length > 0) {
        const eventParams = {
          cmd: SocketCommand.PEER_THREAD_LABELS_UPDATE,
          params: {
            threadIds: threadIdsForEvent,
            labelsRemoved: [],
            labelsAdded: [label.text]
          }
        };
        await postPeerEvent({ data: eventParams });
        threadIdsForEvent = filteredThreadIds.splice(0, PEER_BATCH);
      }

      dispatch(addLabelIdThreadsSuccess(currentLabelId, uniqueIds, labelId));

      let emailLabels = threadsParams.reduce((items, { emailId }) => {
        if (emailId) {
          items.push({
            emailId,
            labelId
          });
        }
        return items;
      }, []);

      if (threadIds) {
        const emails = await getEmailsIdsByThreadIds({ threadIds });
        emailLabels = emailLabels.concat(
          formAddThreadLabelParams(emails, labelId)
        );
      }
      await createEmailLabel({ emailLabels });
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
  currentLabelId,
  spamEmails
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

      const filteredThreadIds = filterTemporalThreadIds(threadIds);
      let threadIdsForEvent = filteredThreadIds.splice(0, PEER_BATCH);
      while (threadIdsForEvent.length > 0) {
        const eventParams = {
          cmd: SocketCommand.PEER_THREAD_LABELS_UPDATE,
          params: {
            threadIds: threadIdsForEvent,
            labelsRemoved,
            labelsAdded
          }
        };
        await postPeerEvent({ data: eventParams });
        threadIdsForEvent = filteredThreadIds.splice(0, PEER_BATCH);
      }

      let labelIds = [];
      if (
        currentLabelId === LabelType.inbox.id &&
        (labelIdToAdd === LabelType.trash.id ||
          labelIdToAdd === LabelType.spam.id)
      )
        labelIds = [...labelIds, currentLabelId];
      if (labelIdToAdd === LabelType.spam.id)
        labelIds = [...labelIds, labelIdToAdd];
      if (labelIds.length) {
        dispatch(updateBadgeLabels(labelIds));
        dispatch(updateBadgeAccounts());
      }
      dispatch(moveThreads(currentLabelId, threadIds));

      const emails = await getEmailsIdsByThreadIds({ threadIds });
      dispatch(addEmailLabels(emails, [labelIdToAdd]));

      if (labelIdToRemove) {
        const paramsToRemove = formRemoveThreadLabelParams(
          emails,
          labelIdToRemove
        );
        await deleteEmailLabel(paramsToRemove);
      }
      const emailLabels = formAddThreadLabelParams(emails, labelIdToAdd);
      await createEmailLabel({ emailLabels });
      if (labelIdToAdd === LabelType.spam.id && spamEmails) {
        const contacts = await getContactByEmails({ emails: spamEmails });
        dispatch(
          modifyContactIsTrusted(contacts.map(contact => contact.id), false)
        );
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

export const removeLabelIdThread = (
  currentLabelId,
  threadId,
  labelId,
  hamEmails
) => {
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
        await postPeerEvent({ data: eventParams });
      }

      dispatch(removeLabelIdThreadSuccess(currentLabelId, threadId, labelId));

      const emails = await getEmailsIdsByThreadIds({ threadIds: [threadId] });
      dispatch(removeEmailLabels(emails, [labelId]));

      const params = formRemoveThreadLabelParams(emails, labelId);
      await deleteEmailLabel(params);

      if (labelId === LabelType.spam.id && hamEmails) {
        const contacts = await getContactByEmails({ emails: hamEmails });
        dispatch(
          modifyContactIsTrusted(contacts.map(contact => contact.id), true)
        );
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
      dispatch(removeLabelIdThreadSuccess(currentLabelId, uniqueId, labelId));
      await deleteEmailLabel({ emailIds: [emailId], labelIds: [labelId] });
    } catch (e) {
      sendUpdateThreadLabelsErrorMessage();
    }
  };
};

export const removeLabelIdThreads = (
  currentLabelId,
  threadsParams,
  labelIdToRemove,
  hamEmails
) => {
  return async dispatch => {
    try {
      const threadIds = threadsParams.map(param => param.threadIdDB);
      const [label] = await getLabelById(labelIdToRemove);
      const filteredThreadIds = filterTemporalThreadIds(threadIds);
      let threadIdsForEvent = filteredThreadIds.splice(0, PEER_BATCH);
      while (threadIdsForEvent.length > 0) {
        const eventParams = {
          cmd: SocketCommand.PEER_THREAD_LABELS_UPDATE,
          params: {
            threadIds: threadIdsForEvent,
            labelsRemoved: [label.text],
            labelsAdded: []
          }
        };
        await postPeerEvent({ data: eventParams });
        threadIdsForEvent = filteredThreadIds.splice(0, PEER_BATCH);
      }

      dispatch(
        removeLabelIdThreadsSuccess(currentLabelId, threadIds, labelIdToRemove)
      );

      let labelToUpdateBadge =
        labelIdToRemove === LabelType.inbox ? LabelType.inbox.id : null;
      labelToUpdateBadge =
        labelIdToRemove === LabelType.spam.id
          ? LabelType.spam.id
          : labelIdToRemove;
      if (labelToUpdateBadge) {
        dispatch(updateBadgeLabels([LabelType.inbox.id]));
        dispatch(updateBadgeAccounts());
      }
      if (labelIdToRemove !== currentLabelId) return;
      dispatch(moveThreads(currentLabelId, threadIds));

      const emails = await getEmailsIdsByThreadIds({ threadIds });
      const params = formRemoveThreadLabelParams(emails, labelIdToRemove);
      await deleteEmailLabel(params);

      const labelsToRemove =
        currentLabelId === LabelType.spam.id
          ? [LabelType.spam.id, LabelType.trash.id]
          : [labelIdToRemove];
      dispatch(removeEmailLabels(emails, labelsToRemove));

      if (labelIdToRemove === LabelType.spam.id && hamEmails) {
        const contacts = await getContactByEmails({ emails: hamEmails });
        dispatch(
          modifyContactIsTrusted(contacts.map(contact => contact.id), true)
        );
      }
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
          const keysArray = email.keys.split(',');
          return [...result, ...keysArray];
        }, []);
        let keysForEvent = metadataKeys.splice(0, PEER_BATCH);
        while (keysForEvent.length > 0) {
          const eventParams = {
            cmd: SocketCommand.PEER_EMAIL_DELETED_PERMANENTLY,
            params: {
              metadataKeys: keysForEvent
            }
          };
          await postPeerEvent({ data: eventParams });
          keysForEvent = metadataKeys.splice(0, PEER_BATCH);
        }

        const uniqueIds = emails.map(email => email.threadId);
        await deleteEmailsByThreadIdAndLabelId({ threadIds, labelId });
        dispatch(removeThreadsSuccess(labelId, uniqueIds));
      }
      if (labelId === LabelType.spam.id) {
        dispatch(updateBadgeLabels([labelId]));
        dispatch(updateBadgeAccounts());
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
        await deleteEmailsByIds({ ids: emailIds });
      }
      const uniqueIds = [...threadIdsDB, ...emailIds];
      dispatch(removeThreadsSuccess(labelId, uniqueIds));
      dispatch(updateBadgeLabels([draftLabelId]));
      dispatch(updateBadgeAccounts());
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

export const updateUnreadThreads = (threadIds, unread, labelId) => {
  return async dispatch => {
    try {
      if (!threadIds.length) return;
      const threadIdsEvent = [...threadIds];
      let threadIdsForEvent = threadIdsEvent.splice(0, PEER_BATCH);
      while (threadIdsForEvent.length > 0) {
        const eventParams = {
          cmd: SocketCommand.PEER_THREAD_READ_UPDATE,
          params: { threadIds: threadIdsForEvent, unread: unread ? 1 : 0 }
        };
        await postPeerEvent({ data: eventParams });
        threadIdsForEvent = threadIdsEvent.splice(0, PEER_BATCH);
      }

      const [response] = await updateUnreadEmailByThreadIds({
        threadIds,
        unread
      });
      if (!response) return;
      dispatch(updateThreadsSuccess(labelId, threadIds, unread));
      if (labelId === LabelType.inbox.id || labelId === LabelType.spam.id) {
        dispatch(updateBadgeLabels([labelId]));
        dispatch(updateBadgeAccounts());
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

export const loadEvents = params => {
  return async dispatch => {
    dispatch(startLoadSync());
    await getGroupEvents(params);
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
        const keys = [...metadataKeys];
        let keysForEvent = keys.splice(0, PEER_BATCH);
        while (keysForEvent.length > 0) {
          const eventParams = {
            cmd: SocketCommand.SEND_OPEN_EVENT,
            params: { metadataKeys }
          };
          await postPeerEvent({ data: eventParams });
          keysForEvent = keys.splice(0, PEER_BATCH);
        }

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
      if (labelId > 0) {
        dispatch(updateBadgeLabels([labelId]));
        dispatch(updateBadgeAccounts());
      }
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
