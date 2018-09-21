import { Label } from '../actions/types';
import { Map, fromJS } from 'immutable';

const labels = (state = new Map({}), action) => {
  switch (action.type) {
    case Label.ADD_BATCH: {
      const labels = fromJS(action.labels);
      const batch = labels.map(label => {
        const visible = !!label.get('visible');
        return label.merge({
          visible
        });
      });
      return state.merge(batch);
    }
    case Label.UPDATE: {
      const labelId = action.label.id;
      if (!labelId) {
        return state;
      }
      return state.set(`${labelId}`, label(state.get(`${labelId}`), action));
    }
    case Label.UPDATE_BADGE_LABELS: {
      const labelIds = action.labelIds;
      if (!labelIds) {
        return state;
      }
      if (labelIds.length === 2) {
        return state.merge({
          [`${labelIds[0].id}`]: label(state.get(`${labelIds[0].id}`), {
            ...action,
            label: labelIds[0]
          }),
          [`${labelIds[1].id}`]: label(state.get(`${labelIds[1].id}`), {
            ...action,
            label: labelIds[1]
          })
        });
      }
      return state.set(
        `${labelIds[0].id}`,
        label(state.get(`${labelIds[0].id}`), {
          ...action,
          label: labelIds[0]
        })
      );
    }
    case Label.REMOVE: {
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
    case Label.UPDATE:
    case Label.UPDATE_BADGE_LABELS: {
      const visible = action.label.visible;
      const badge = action.label.badge;
      return state.merge({
        badge: typeof badge === 'number' ? badge : state.get('badge'),
        color: action.label.color || state.get('color'),
        text: action.label.text || state.get('text'),
        visible: typeof visible === 'boolean' ? visible : state.get('visible')
      });
    }
    default:
      return state;
  }
};

export default labels;
