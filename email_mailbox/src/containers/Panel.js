import { connect } from 'react-redux';
import { loadThreads, updateLabelSuccess } from '../actions';
import PanelWrapper from '../components/PanelWrapper';
import {
  LabelType,
  myAccount,
  updateAccount
} from '../utils/electronInterface';

const mapStateToProps = state => {
  const threadsCount = state.get('threads').size;
  return {
    threadsCount
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLoadThreads: params => {
      dispatch(loadThreads(params));
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
    }
  };
};

const Panel = connect(mapStateToProps, mapDispatchToProps)(PanelWrapper);

export default Panel;
