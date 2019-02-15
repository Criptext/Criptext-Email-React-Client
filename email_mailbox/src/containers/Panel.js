import { connect } from 'react-redux';
import {
  addLabels,
  loadEmails,
  loadEvents,
  loadThreads,
  removeThreadsSuccess,
  updateBadgeLabels,
  updateEmailIdsThread,
  updateAllFeedItemsAsOlder,
  updateStatusThread,
  unsendEmailOnSuccess,
  unsendEmailFiles,
  setAvatarUpdatedTimestamp,
  stopLoadSync
} from '../actions';
import PanelWrapper from '../components/PanelWrapper';
import { LabelType } from '../utils/electronInterface';
import { updateSettings } from '../utils/ipc';
import { storeSeenTimestamp } from '../utils/storage';
import { defineRejectedLabels } from '../utils/EmailUtils';

const mapStateToProps = state => {
  const threadsCount = state.get('threads').get('list').size;
  return {
    threadsCount
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
    onAddLabels: labels => {
      dispatch(addLabels(labels));
    },
    onLoadEmails: threadId => {
      dispatch(loadEmails(threadId));
    },
    onLoadEvents: () => {
      dispatch(loadEvents());
    },
    onLoadThreads: params => {
      const { labelId } = params;
      const rejectedLabelIds = defineRejectedLabels(labelId);
      const contactTypes = defineContactType(labelId);
      dispatch(loadThreads({ ...params, rejectedLabelIds, contactTypes }));
    },
    onMarkThreadAsOpen: (threadId, status) => {
      dispatch(updateStatusThread(threadId, Number(status)));
    },
    onRemoveThreads: threadIds => {
      dispatch(removeThreadsSuccess(threadIds));
    },
    onStopLoadSync: () => {
      dispatch(stopLoadSync());
    },
    onUnsendEmail: (emailId, date, status) => {
      dispatch(unsendEmailOnSuccess(String(emailId), date, status));
      dispatch(unsendEmailFiles(emailId));
    },
    onUpdateAvatar: () => {
      dispatch(setAvatarUpdatedTimestamp(Date.now()));
    },
    onUpdateEmailIdsThread: ({ threadId, emailIdToAdd, emailIdsToRemove }) => {
      dispatch(
        updateEmailIdsThread({ threadId, emailIdToAdd, emailIdsToRemove })
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
