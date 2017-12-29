import * as Types from '../actions/types';
import { List, fromJS } from 'immutable';

export default (state = List([]), action) => {
  switch (action.type) {
    case Types.Thread.SELECT:
      return state.update(action.selectedThread, thread => {
        return thread.set('unread', false);
      });
    case Types.Thread.ADD_BATCH:
      return state.concat(fromJS(action.threads));
    default:
      return state;
  }
};
