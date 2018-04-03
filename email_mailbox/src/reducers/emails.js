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
    case Email.MARK_UNREAD: {
      const item = state.get(action.emailId.toString());
      if (item === undefined) {
        return state;
      }
      const newItem = item.set('unread', action.unread);
      const newState = state.set(action.emailId.toString(), newItem);
      return newState;
    }
    default:
      return state;
  }
};
