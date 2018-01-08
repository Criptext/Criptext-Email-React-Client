import { Label } from '../actions/types';
import { Map, fromJS } from 'immutable';

export default (state = new Map({}), action) => {
  switch (action.type) {
    case Label.ADD_BATCH:
      return state.merge(fromJS(action.labels));
    default:
      return state;
  }
};
