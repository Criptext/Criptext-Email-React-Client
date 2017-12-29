export const parseAllContacts = contacts => {
  const resContacts = [];
  if (!contacts) {
    return resContacts;
  }
  const conts = contacts.split(',');
  conts.forEach(cont => {
    resContacts.push(parseContact(cont));
  });
  return resContacts;
};

export const parseContact = user => {
  const us = user.replace('("|<|>)/g', '');
  let email = '';
  let name = null;
  const parts = us.split(' ');
  parts.forEach(part => {
    if (!part) {
      return;
    }
    if (part.indexOf('@') > -1) {
      email = part;
      return;
    } else {
      if (name == null) {
        name = part;
      } else {
        name += ' ' + part;
      }
    }
  });
  return {
    email: email,
    name: name || email.split('@')[0]
  };
};
