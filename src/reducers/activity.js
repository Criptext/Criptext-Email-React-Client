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
    case Types.Thread.DESELECT_THREADS:
      if(action.spread){
        console.log(action.spread);
        return state.set('multiselect', false);
      }
      return state;
    case Types.Thread.MOVE_THREADS:
      return state.set('multiselect', false);
    default:
      return state;
  }
};
