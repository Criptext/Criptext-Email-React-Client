import { Email } from '../actions/types';
import { Map, fromJS } from 'immutable';

export default (state = new Map(), action) => {
  switch (action.type) {
    case Email.ADD_BATCH: {
      return state.merge(fromJS(action.emails));
    }
    case Email.MUTE: {
      const item = state.find(email => email.get('id') === action.targetEmail);
      if (item !== undefined) {
        const index = state.findIndex(
          email => email.get('id') === action.targetEmail
        );
        return state.update(index, email => {
          const prevMutedState = email.get('isMuted');
          return email.set('isMuted', !prevMutedState);
        });
      }
      return state;
    }
    default:
      return state;
  }
};
