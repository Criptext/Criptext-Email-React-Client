import { connect } from 'react-redux';
import {
  addDataApp,
  loadApp,
  loadEmails,
  loadEvents,
  loadThreads,
  logout,
  updateBadgeLabels,
  updateEmailIdsThread,
  updateAllFeedItemsAsOlder,
  unsendEmailOnSuccess,
  unsendEmailFiles,
  updateLoadingSync,
  stopLoadSync
} from '../actions';
import PanelWrapper from '../components/PanelWrapper';
import { LabelType } from '../utils/electronInterface';
import { selectAccountAsActive } from '../utils/electronEventInterface';
import { updateSettings } from '../utils/ipc';
import { storeSeenTimestamp } from '../utils/storage';
import { defineRejectedLabels } from '../utils/EmailUtils';
import { defineParamsToLoadThread } from '../utils/ThreadUtils';

const mapStateToProps = state => {
  const isLoadAppCompleted = !!state.get('labels').size;
  const threadsCount = state
    .get('threads')
    .get(`${LabelType.inbox.id}`)
    .get('list').size;
  return {
    threadsCount,
    isLoadAppCompleted
  };
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
    onUpdateAccountApp: async ({ mailboxSelected, accountId, recipientId }) => {
      await selectAccountAsActive({ accountId, recipientId });
      dispatch(logout());
      if (mailboxSelected) {
        const params = defineParamsToLoadThread(mailboxSelected, true);
        dispatch(loadApp(params));
      }
    },
    onLoadEmails: threadId => {
      dispatch(loadEmails(threadId));
    },
    onLoadEvents: params => {
      dispatch(loadEvents(params));
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
    onUpdateTimestamp: () => {
      storeSeenTimestamp();
      dispatch(updateAllFeedItemsAsOlder());
    },
    onUpdateUnreadEmailsBadge: labelIds => {
      dispatch(updateBadgeLabels(labelIds));
    }
  };
};

const Panel = connect(
  mapStateToProps,
  mapDispatchToProps
)(PanelWrapper);

export default Panel;
