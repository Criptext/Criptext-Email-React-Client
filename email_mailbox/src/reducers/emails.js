import { Email } from '../actions/types';
import { Map, fromJS } from 'immutable';

export default (state = new Map({}), action) => {
  switch (action.type) {
    case Email.ADD_BATCH:
      return state.merge(fromJS(action.emails));
    default:
      return state;
  }
};
