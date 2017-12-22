import { connect } from 'react-redux';
import * as actions from '../actions/index';
import ThreadsView from './ThreadsView';

const mapStateToProps = state => {
  const threads = state.threads || {};
  const threadsArray = Object.keys(threads)
    .map(key => {
      return threads[key];
    })
    .sort((t1, t2) => {
      return t2.lastEmailDate - t1.lastEmailDate;
    });
  return {
    threads: threadsArray,
    selectedThread: state.activities.selectedThread
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onAddThreads: threads => {
      dispatch(actions.addThreads(threads));
    },
    onSelectThread: threadId => {
      dispatch(actions.selectThread(threadId));
    }
  };
};

const ThreadsList = connect(mapStateToProps, mapDispatchToProps)(ThreadsView);

export default ThreadsList;
