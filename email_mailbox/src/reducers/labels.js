import { Label } from '../actions/types';
import { Map, fromJS } from 'immutable';

const labels = (state = new Map({}), action) => {
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
    case Label.REMOVE_SUCCESS: {
      const { labelId } = action;
      if (!labelId) {
        return state;
      }
      return state.delete(labelId);
    }
    default:
      return state;
  }
};

const label = (state, action) => {
  switch (action.type) {
    case Label.UPDATE_SUCCESS: {
      let badge = state.get('badge');
      if (action.label.operation === 'add') {
        badge = state.get('badge') + action.label.value;
      } else if (action.label.operation === 'less') {
        badge = state.get('badge') - action.label.value;
      }

      return state.merge({
        color: action.label.color ? action.label.color : state.get('color'),
        text: action.label.text ? action.label.text : state.get('text'),
        visible:
          action.label.visible !== undefined
            ? action.label.visible
            : state.get('visible'),
        badge
      });
    }
    default:
      return state;
  }
};

export default labels;
