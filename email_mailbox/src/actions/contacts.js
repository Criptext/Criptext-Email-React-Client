import { Contact } from './types';
import { defineContacts } from './../utils/ContactUtils';

export const addContacts = contacts => {
  return {
    type: Contact.ADD_BATCH,
    contacts
  };
};

export const loadContacts = ids => {
  return async dispatch => {
    try {
      const contacts = await defineContacts(ids);
      dispatch(addContacts(contacts));
    } catch (e) {
      // TO DO
    }
  };
};
