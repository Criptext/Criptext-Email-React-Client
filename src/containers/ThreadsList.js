import { connect } from 'react-redux';
import { loadThreads, filterThreadsByUnread } from '../actions/index';
import ThreadsListView from '../components/ThreadsList';

const mapStateToProps = state => {
  const unreadFilter = state.get('activities').get('unreadFilter');
  const threads = unreadFilter
    ? state.get('threads').filter(thread => {
        return thread.get('unread');
      })
    : state.get('threads');
  return {
    threads: threads,
    selectedThread: state.get('activities').get('selectedThread'),
    unreadFilter: unreadFilter,
    labels: state.get('labels')
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLoadThreads: () => {
      dispatch(loadThreads(dispatch));
    },
    onUnreadToggle: enabled => {
      dispatch(filterThreadsByUnread(enabled));
    }
  };
};

const ThreadsList = connect(mapStateToProps, mapDispatchToProps)(
  ThreadsListView
);

export default ThreadsList;
