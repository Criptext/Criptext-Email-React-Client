import { Email } from '../actions/types';
import { Map, fromJS } from 'immutable';

const emails = (state = new Map(), action) => {
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
      return state.set(action.emailId.toString(), email(item, action));
    }
    case Email.UNSEND: {
      const { emailId, unsendDate, status } = action;
      if (
        typeof emailId !== 'string' ||
        !unsendDate ||
        typeof status !== 'number'
      ) {
        return state;
      }
      const item = state.get(emailId);
      if (!item) {
        return state;
      }
      return state.set(emailId, email(item, action));
    }
    default:
      return state;
  }
};

const email = (state, action) => {
  switch (action.type) {
    case Email.MARK_UNREAD: {
      return state.set('unread', action.unread);
    }
    case Email.UNSEND: {
      const { unsendDate, status } = action;
      return (
        state &&
        state.merge({
          content: '',
          preview: '',
          status,
          unsendDate
        })
      );
    }
    default:
      return state;
  }
};

export default emails;
