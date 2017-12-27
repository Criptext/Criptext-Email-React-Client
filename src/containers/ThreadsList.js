import { connect } from 'react-redux';
import * as actions from '../actions/index';
import ThreadsListView from '../components/ThreadsList';

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
    }
  };
};

const ThreadsList = connect(mapStateToProps, mapDispatchToProps)(ThreadsListView);

export default ThreadsList;
