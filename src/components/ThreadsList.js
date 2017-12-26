import { connect } from 'react-redux';
import * as actions from '../actions/index';
import ThreadsView from './ThreadsView';

const mapStateToProps = state => {
  return {
    threads: state.get('threads'),
    selectedThread: state.get('activities').selectedThread
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLoadThreads: () => {
      dispatch(actions.loadThreads(dispatch));
    },
    onSelectThread: threadPosition => {
      dispatch(actions.selectThread(threadPosition));
    }
  };
};

const ThreadsList = connect(mapStateToProps, mapDispatchToProps)(ThreadsView);

export default ThreadsList;
