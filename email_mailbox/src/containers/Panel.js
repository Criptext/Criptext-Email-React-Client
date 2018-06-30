import { connect } from 'react-redux';
import {
  addEmailToThread,
  loadThreads,
  updateLabelSuccess,
  updateAllFeedItemsAsOlder,
  loadEmails
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
    onAddEmailToThread: ({ threadId, emailId }) => {
      dispatch(addEmailToThread({ threadId, emailId }));
    },
    onLoadEmails: threadId => {
      dispatch(loadEmails(threadId));
    },
    onLoadThreads: params => {
      const { labelId } = params;
      const rejectedLabelIds = defineRejectedLabels(labelId);
      dispatch(loadThreads({ ...params, ...rejectedLabelIds }));
    },
    onUpdateOpenedAccount: async () => {
      const opened = true;
      const recipientId = myAccount.recipientId;
      await updateAccount({ opened, recipientId });
    },
    onUpdateUnreadEmails: () => {
      const label = {
        id: LabelType.inbox.id,
        badgeOperation: +1
      };
      dispatch(updateLabelSuccess(label));
    },
    onUpdateTimestamp: () => {
      storeSeenTimestamp();
      dispatch(updateAllFeedItemsAsOlder());
    }
  };
};

const Panel = connect(mapStateToProps, mapDispatchToProps)(PanelWrapper);

export default Panel;
