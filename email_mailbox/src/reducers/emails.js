import { Email } from '../actions/types';
import { Map, fromJS } from 'immutable';

export default (state = new Map(), action) => {
  switch (action.type) {
    case Email.ADD_BATCH: {
      return state.merge(fromJS(action.emails));
    }
    case Email.MUTE: {
      const item = state.get(action.emailId);
      if (item !== undefined) {
        const prevMutedState = item.get('isMuted');
        const newItem =
          prevMutedState === 1
            ? item.set('isMuted', 0)
            : item.set('isMuted', 1);
        return state.set(action.emailId, newItem);
      }
      return state;
    }
    default:
      return state;
  }
};
