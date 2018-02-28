import { User } from '../actions/types';
import { Map, fromJS } from 'immutable';

export default (state = new Map({}), action) => {
  switch (action.type) {
    case User.ADD_BATCH: {
      return state.merge(fromJS(action.users));
    }
    default:
      return state;
  }
};
