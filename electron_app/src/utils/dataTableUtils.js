const formContactsRow = contacts => {
  return contacts.map(contact => {
    const emailMatched = contact.match(/<(.*)>/);
    const email = emailMatched ? emailMatched[1] : contact;
    const name = emailMatched
      ? contact.slice(0, contact.indexOf('<') - 1)
      : null;
    return { email, name };
  });
};

module.exports = {
  formContactsRow
};
