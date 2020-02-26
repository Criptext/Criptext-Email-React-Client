import { connect } from 'react-redux';
import {
  addDataApp,
  loadApp,
  loadEmails,
  loadEvents,
  loadFeedItems,
  loadThreads,
  logout,
  updateUnreadThreads,
  updateBadgeAccounts,
  updateBadgeLabels,
  updateEmailIdsThread,
  updateFeedItems,
  unsendEmailOnSuccess,
  unsendEmailFiles,
  updateLabels,
  updateLoadingSync,
  removeLabels,
  stopLoadSync
} from '../actions';
import PanelWrapper from '../components/PanelWrapper';
import { LabelType } from '../utils/electronInterface';
import {
  isGettingEventsUpdate,
  selectAccountAsActive
} from '../utils/electronEventInterface';
import { updateSettings } from '../utils/ipc';
import { defineRejectedLabels } from '../utils/EmailUtils';
import { loadThreadsAndEmails } from '../actions/threads';
import { defineParamsToLoadThread } from '../utils/ThreadUtils';

const mapStateToProps = state => {
  const isLoadAppCompleted = !!state.get('labels').size;
  const labelIds = state
    .get('threads')
    .keySeq()
    .toArray();
  const result = labelIds.reduce((result, id) => {
    const size = state
      .get('threads')
      .get(`${id}`)
      .get('list').size;
    return { ...result, [id]: size, isLoadAppCompleted };
  }, {});
  return result;
};

const defineContactType = labelId => {
  if (labelId === LabelType.sent.id || labelId === LabelType.draft.id) {
    return ['to', 'cc'];
  }
  return ['from'];
};

const mapDispatchToProps = dispatch => {
  return {
    onAddDataApp: data => {
      dispatch(addDataApp(data));
    },
    onNotificationClicked: async ({ threadId }) => {
      const labelId = LabelType.inbox.id;
      const unread = false;
      const loadThreadsParams = {
        labelId,
        rejectedLabelIds: defineRejectedLabels(labelId),
        contactTypes: defineContactType(labelId)
      };
      await dispatch(loadThreads(loadThreadsParams));
      await dispatch(updateUnreadThreads([threadId], unread, labelId));
    },
    onUpdateAccountApp: async ({ mailboxSelected, accountId, recipientId }) => {
      isGettingEventsUpdate(true);
      await selectAccountAsActive({ accountId, recipientId });
      await dispatch(logout());
      isGettingEventsUpdate(false);
      if (mailboxSelected) {
        const params = defineParamsToLoadThread(mailboxSelected, true);
        await dispatch(loadApp(params));
      }
    },
    onUpdateLabels: labels => {
      dispatch(updateLabels(labels));
    },
    onRemoveLabels: labelIds => {
      dispatch(removeLabels(labelIds));
    },
    onLoadEmails: threadId => {
      dispatch(loadEmails({ threadId }));
    },
    onLoadEvents: params => {
      dispatch(loadEvents(params));
    },
    onLoadFeedItems: () => {
      dispatch(loadFeedItems(true));
    },
    onLoadThreads: (params, shouldStopAll) => {
      const { labelId } = params;
      const rejectedLabelIds = defineRejectedLabels(labelId);
      const contactTypes = defineContactType(labelId);
      dispatch(
        loadThreads(
          { ...params, rejectedLabelIds, contactTypes },
          shouldStopAll
        )
      );
    },
    onLoadThreadsAndEmails: (params, threadId, shouldStopAll) => {
      const { labelId } = params;
      const rejectedLabelIds = defineRejectedLabels(labelId);
      const contactTypes = defineContactType(labelId);
      dispatch(
        loadThreadsAndEmails(
          { ...params, rejectedLabelIds, contactTypes },
          threadId,
          shouldStopAll
        )
      );
    },
    onStopLoadSync: () => {
      dispatch(stopLoadSync());
    },
    onUnsendEmail: (emailId, date, status) => {
      dispatch(unsendEmailOnSuccess(String(emailId), date, status));
      dispatch(unsendEmailFiles(emailId));
    },
    onUpdateLoadingSync: ({ totalTask, completedTask }) => {
      dispatch(updateLoadingSync({ totalTask, completedTask }));
    },
    onUpdateEmailIdsThread: ({
      labelId,
      threadId,
      emailIdToAdd,
      emailIdsToRemove
    }) => {
      dispatch(
        updateEmailIdsThread({
          labelId,
          threadId,
          emailIdToAdd,
          emailIdsToRemove
        })
      );
    },
    onUpdateOpenedAccount: async () => {
      return await updateSettings({ opened: true });
    },
    onUpdateFeedItems: feedItemIds => {
      dispatch(updateFeedItems({ ids: feedItemIds, seen: true }));
    },
    onUpdateUnreadEmailsBadge: labelIds => {
      dispatch(updateBadgeLabels(labelIds));
      dispatch(updateBadgeAccounts());
    }
  };
};

const Panel = connect(mapStateToProps, mapDispatchToProps)(PanelWrapper);

export default Panel;
