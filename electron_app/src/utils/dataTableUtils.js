const { HTMLTagsRegex } = require('./RegexUtils');

const formContactsRow = contacts => {
  return contacts.map(contact => {
    const emailMatched = contact.match(HTMLTagsRegex);
    if (emailMatched) {
      const emailTag = emailMatched.pop();
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
