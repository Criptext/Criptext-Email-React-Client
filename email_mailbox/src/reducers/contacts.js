import { Contact } from '../actions/types';

export default (state = {}, action) => {
  switch (action.type) {
    case Contact.ADD_BATCH: {
      return {
        ...state,
        ...action.users
      };
    }
    case Contact.ADD: {
      const email = action.contact.email.toString();
      return {
        ...state,
        [email]: action.user
      };
    }
    default:
      return state;
  }
};
