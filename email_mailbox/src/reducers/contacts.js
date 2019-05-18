import { Activity, Contact } from '../actions/types';
import { Map, fromJS } from 'immutable';

export default (state = new Map(), action) => {
  switch (action.type) {
    case Contact.ADD_BATCH: {
      return state.merge(fromJS(action.contacts));
    }
    case Activity.LOGOUT:
      return new Map();
    default:
      return state;
  }
};
