import { Thread } from '../actions/types';
import { Map } from 'immutable';
export default (state = Map(), action) => {
  switch (action.type) {
    case Thread.SELECT:
      return state.merge({
        multiselect: false
      });
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
    default:
      return state;
  }
};
