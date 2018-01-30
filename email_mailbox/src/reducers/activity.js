import { Thread, General } from '../actions/types';
import { Map } from 'immutable';
export default (state = Map({mailbox: 'inbox', stance: 'threads'}), action) => {
  switch (action.type) {
    case Thread.SELECT:
      return state.merge({
        selectedThread: action.thread,
        stance: 'emails',
        multiselect: false
      })
    case Thread.MULTISELECT:
      return state.set('multiselect', true);
    case Thread.UNREAD_FILTER:
      return state.set('unreadFilter', action.enabled);
    case Thread.DESELECT_THREADS:
      if (action.spread) {
        return state.set('multiselect', false);
      }
      return state;
    case Thread.MOVE_THREADS:
      return state.set('multiselect', false);
    case General.CHANGE_MAILBOX:
      return state.set('mailbox', action.mailbox);
    case Thread.CLOSE_THREAD:
      return state.merge({
        selectedThread: null,
        stance: 'threads'
      })
    default:
      return state;
  }
};
