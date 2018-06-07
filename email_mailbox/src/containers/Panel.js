import { connect } from 'react-redux';
import { loadThreads } from '../actions';
import PanelWrapper from '../components/PanelWrapper';
import { myAccount, updateAccount } from '../utils/electronInterface';

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
    onUpdateOpenedAccount: () => {
      const opened = true;
      const recipientId = myAccount.recipientId;
      updateAccount({ opened, recipientId });
    }
  };
};

const Panel = connect(mapStateToProps, mapDispatchToProps)(PanelWrapper);

export default Panel;
