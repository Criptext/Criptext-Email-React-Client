const { HTMLTagsRegex } = require('./RegexUtils');

const formContactsRow = contacts => {
  return contacts.map(contact => {
    const emailMatched = contact.match(HTMLTagsRegex);
    if (emailMatched) {
      const lastPosition = emailMatched.length - 1;
      const emailTag = emailMatched[lastPosition];
      const email = emailTag.replace(/[<>]/g, '').toLowerCase();
      const name = contact.slice(0, contact.indexOf(emailTag) - 1);
      return { email, name };
    }
    return { email: contact.toLowerCase(), name: null };
  });
};

module.exports = {
  formContactsRow
};
