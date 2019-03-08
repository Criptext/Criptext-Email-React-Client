import { Activity } from '../actions/types';
import { Map } from 'immutable';

const initActivity = Map({
  avatarTimestamp: Date.now(),
  isFilteredByUnreadThreads: false,
  isLoadingThreads: true,
  isSyncing: true
});

const activity = (state = initActivity, action) => {
  switch (action.type) {
    case Activity.AVATAR_UPDATED_TIMESTAMP:
      return state.set('avatarTimestamp', action.timestamp);
    case Activity.UNREAD_FILTER:
      return state.update(
        'isFilteredByUnreadThreads',
        switchUnreadThreadsStatus => !switchUnreadThreadsStatus
      );
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
