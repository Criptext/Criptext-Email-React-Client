import { Thread, Activity } from '../actions/types';
import { Map } from 'immutable';

const initActivity = Map({
  isFilteredByUnreadThreads: false,
  isLoadingThreads: false,
  isSyncing: false
});
const activity = (state = initActivity, action) => {
  switch (action.type) {
    case Thread.UNREAD_FILTER:
      return state.update(
        'isFilteredByUnreadThreads',
        switchUnreadThreadsStatus => !switchUnreadThreadsStatus
      );
    case Thread.DESELECT_THREADS:
      if (action.spread) {
        return state.set('multiselect', false);
      }
      return state;
    case Activity.START_LOAD_SYNC:
      return state.set('isSyncing', true);
    case Activity.STOP_LOAD_SYNC:
      return state.set('isSyncing', false);
    case Activity.START_LOAD_THREAD:
      return state.set('isLoadingThreads', true);
    case Activity.STOP_LOAD_THREAD:
      return state.set('isLoadingThreads', false);
    default:
      return state;
  }
};

export default activity;
