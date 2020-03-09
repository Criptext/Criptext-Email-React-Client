import { Activity, File } from '../actions/types';
import { Map, fromJS } from 'immutable';

const files = (state = new Map({}), action) => {
  switch (action.type) {
    case File.ADD_BATCH:
      return state.merge(fromJS(action.files));
    case Activity.LOGOUT:
      return new Map();
    case File.UNSEND_FILES: {
      if (!action.emailId) {
        return state;
      }
      return state.map(fileItem => {
        return fileItem.get('emailId') === action.emailId
          ? file(fileItem, action)
          : fileItem;
      });
    }
    default:
      return state;
  }
};

const file = (state, action) => {
  switch (action.type) {
    case File.UNSEND_FILES: {
      return state.set('status', action.status);
    }
    default:
      return state;
  }
};

export default files;
