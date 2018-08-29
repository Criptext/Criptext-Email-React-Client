import { connect } from 'react-redux';
import {
  loadEmails,
  loadThreads,
  removeThreadsByThreadIdsOnSuccess,
  updateEmailIdsThread,
  updateLabelSuccess,
  updateAllFeedItemsAsOlder,
  updateStatusThread,
  unsendEmailOnSuccess,
  unsendEmailFiles,
  updateUnreadThreadsSuccess
} from '../actions';
import PanelWrapper from '../components/PanelWrapper';
import {
  LabelType,
  myAccount,
  updateAccount
} from '../utils/electronInterface';
import { storeSeenTimestamp } from '../utils/storage';

const mapStateToProps = state => {
  const threadsCount = state.get('threads').size;
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

const defineRejectedLabels = labelId => {
  switch (labelId) {
    case LabelType.allmail.id:
      return [LabelType.spam.id, LabelType.trash.id, LabelType.draft.id];
    case LabelType.spam.id:
    case LabelType.trash.id:
      return [];
    default:
      return [LabelType.spam.id, LabelType.trash.id];
  }
};

const mapDispatchToProps = dispatch => {
  return {
    onUpdateEmailIdsThread: ({ threadId, emailIdToAdd, emailIdsToRemove }) => {
      dispatch(
        updateEmailIdsThread({ threadId, emailIdToAdd, emailIdsToRemove })
      );
    },
    onLoadEmails: threadId => {
      dispatch(loadEmails(threadId));
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
    onUpdateOpenedAccount: async () => {
      const opened = true;
      const recipientId = myAccount.recipientId;
      await updateAccount({ opened, recipientId });
    },
    onUpdateUnreadEmailsBadge: ({ labelId, operation, value }) => {
      const label = {
        id: labelId,
        operation,
        value
      };
      dispatch(updateLabelSuccess(label));
    },
    onUpdateTimestamp: () => {
      storeSeenTimestamp();
      dispatch(updateAllFeedItemsAsOlder());
    },
    onUnsendEmail: (emailId, date, status) => {
      dispatch(unsendEmailOnSuccess(String(emailId), date, status));
      dispatch(unsendEmailFiles(emailId));
    },
    onRemoveThreads: threadIds => {
      dispatch(removeThreadsByThreadIdsOnSuccess(threadIds));
    },
    onUpdateUnreadThreads: (threadIds, unread) => {
      dispatch(updateUnreadThreadsSuccess(threadIds, unread));
    }
  };
};

const Panel = connect(
  mapStateToProps,
  mapDispatchToProps
)(PanelWrapper);

export default Panel;
