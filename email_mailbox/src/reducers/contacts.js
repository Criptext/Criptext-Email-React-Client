import { Activity, Contact } from '../actions/types';
import { Map, fromJS } from 'immutable';

const contacts = (state = new Map(), action) => {
  switch (action.type) {
    case Contact.ADD_BATCH: {
      return state.merge(fromJS(action.contacts));
    }
    case Contact.MODIFY_IS_TRUSTED: {
      const { contactId } = action;
      if (!contactId) return state;
      const contactItem = state.get(`${contactId}`);
      if (!contactItem) return state;

      return state.set(`${contactId}`, contact(contactItem, action));
    }
    case Activity.LOGOUT:
      return new Map();
    default:
      return state;
  }
};

const contact = (state, action) => {
  switch (action.type) {
    case Contact.MODIFY_IS_TRUSTED: {
      const { isTrusted } = action;
      return state.merge({
        isTrusted: isTrusted ? 1 : 0
      });
    }
    default:
      return state;
  }
};

export default contacts;
