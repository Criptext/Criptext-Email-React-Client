import { connect } from 'react-redux';
import {
  loadEvents,
  loadThreads,
  filterThreadsByUnread
} from '../actions/index';
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
    unreadFilter: unreadFilter
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLoadThreads: params => {
      if (params.labelId === 3) {
        params['contactTypes'] = ['to'];
      }
      dispatch(loadThreads(params));
    },
    onLoadEvents: params => {
      dispatch(loadEvents(params));
    },
    onUnreadToggle: enabled => {
      dispatch(filterThreadsByUnread(enabled));
    }
  };
};

const Threads = connect(mapStateToProps, mapDispatchToProps)(ThreadsView);

export default Threads;
