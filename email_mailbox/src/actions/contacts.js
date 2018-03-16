import { Contact } from './types';

export const addContacts = contacts => {
  return {
    type: Contact.ADD_BATCH,
    contacts: contacts
  };
};

export const addContact = contact => {
  return {
    type: Contact.ADD,
    contact: contact
  };
};
