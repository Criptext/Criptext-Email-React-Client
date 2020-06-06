export const getContacts = state => state.get('contacts');

export const defineContact = (contacts, contactIds) => {
  return contactIds
    ? contactIds.map(contactId => {
        const contact = contacts.get(`${contactId}`);
        return contacts.size && contact
          ? contact.toObject()
          : { id: contactId };
      })
    : [];
};

export const defineContactFrom = (contacts, contactIds, fromTmp) => {
  return contactIds
    ? contactIds.map(contactId => {
        const contact = contacts.get(`${contactId}`);
        return contacts.size && contact
          ? contact.toObject()
          : fromTmp.name
            ? [fromTmp]
            : { id: contactId };
      })
    : fromTmp.name
      ? [fromTmp]
      : [];
};
