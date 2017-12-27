import * as Types from '../actions/types';
import { Map, fromJS } from 'immutable';

export default (state = new Map({}), action) => {
  switch (action.type) {
    case Types.Email.ADD_EMAILS:
      return state.merge(fromJS(action.emails));
    default:
      return state;
  }
};
