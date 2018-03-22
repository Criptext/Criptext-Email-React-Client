import { Contact } from './types';
import * as db from '../utils/electronInterface';

export const addContacts = contacts => {
  return {
    type: Contact.ADD_BATCH,
    contacts: contacts
  };
};

export const loadContacts = ids => {
  return async dispatch => {
    try {
      const response = await db.getContactByIds(ids);
      const contacts = response.reduce(
        (result, element) => ({
          ...result,
          [element.id]: element
        }),
        {}
      );
      dispatch(addContacts(contacts));
    } catch (e) {
      // TO DO
    }
  };
};
