import { connect } from 'react-redux';
import { loadThreads, filterThreadsByUnread } from '../actions/index';
import ThreadsView from '../components/Threads';

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
    unreadFilter: unreadFilter
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLoadThreads: params => {
      dispatch(loadThreads(params));
    },
    onUnreadToggle: enabled => {
      dispatch(filterThreadsByUnread(enabled));
    }
  };
};

const Threads = connect(mapStateToProps, mapDispatchToProps)(ThreadsView);

export default Threads;
