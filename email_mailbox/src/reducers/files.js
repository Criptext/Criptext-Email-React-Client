import { File } from '../actions/types';
import { Map, fromJS } from 'immutable';

const files = (state = new Map({}), action) => {
  switch (action.type) {
    case File.ADD_BATCH:
      return state.merge(fromJS(action.files));
    case File.UNSEND_FILES: {
      if (!action.emailId) {
        return state;
      }
      return state.map(file => {
        if (file.get('emailId') === action.emailId) {
          return file.set('status', action.status);
        }
        return file;
      });
    }
    default:
      return state;
  }
};

export default files;
