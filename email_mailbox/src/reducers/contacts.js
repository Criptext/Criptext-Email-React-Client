import { Activity, Contact } from '../actions/types';
import { Map, fromJS } from 'immutable';

const contacts = (state = new Map(), action) => {
  switch (action.type) {
    case Contact.ADD_BATCH: {
      return state.merge(fromJS(action.contacts));
    }
    case Contact.MODIFY_IS_TRUSTED: {
      const contacts = action.contactIds;
      if (!contacts || !contacts.length) return state;
      const isTrusted = action.isTrusted;
      if (isTrusted === undefined) return state;
      return contacts.reduce((state, contactId) => {
        const contactState = state.get(`${contactId}`);
        if (!contactState) return state;
        const action = { type: Contact.MODIFY_IS_TRUSTED, isTrusted };
        return state.set(`${contactId}`, contact(contactState, action));
      }, state);
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
