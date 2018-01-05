import * as Types from '../actions/types';
import { Map } from 'immutable';
export default (state = Map({}), action) => {
  switch (action.type) {
    case Types.Thread.SELECT:
      return state.merge({
        selectedThread: action.selectedThread,
        multiselect: false
      });
    case Types.Thread.MULTISELECT:
      return state.set('multiselect', true);
    case Types.Thread.UNREAD_FILTER:
      return state.set('unreadFilter', action.enabled);
    default:
      return state;
  }
};
