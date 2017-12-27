import { connect } from 'react-redux';
import { loadThreads } from '../actions/index';
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
      dispatch(loadThreads(dispatch));
    }
  };
};

const ThreadsList = connect(mapStateToProps, mapDispatchToProps)(
  ThreadsListView
);

export default ThreadsList;
