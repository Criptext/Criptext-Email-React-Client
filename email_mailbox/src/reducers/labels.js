import { Label } from '../actions/types';
import { Map, fromJS } from 'immutable';

export default (state = new Map({}), action) => {
  switch (action.type) {
    case Label.ADD_BATCH:
      return state.merge(fromJS(action.labels));
    case Label.UPDATE_SUCCESS: {
      const labelId = action.label.id;
      if (!labelId) {
        return state;
      }
      return state.set(`${labelId}`, label(state.get(`${labelId}`), action));
    }
    default:
      return state;
  }
};

const label = (state, action) => {
  switch (action.type) {
    case Label.UPDATE_SUCCESS:
      return state.merge({
        color: action.label.color ? action.label.color : state.get('color'),
        text: action.label.text ? action.label.text : state.get('text')
      });
    default:
      return state;
  }
};
