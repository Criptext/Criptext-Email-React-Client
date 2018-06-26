import { File } from '../actions/types';
import { Map, fromJS } from 'immutable';

const files = (state = new Map({}), action) => {
  switch (action.type) {
    case File.ADD_BATCH:
      return state.merge(fromJS(action.files));
    default:
      return state;
  }
};

export default files;
