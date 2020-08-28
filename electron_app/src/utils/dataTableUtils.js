const { HTMLTagsRegex } = require('./RegexUtils');

const formContactsRow = (contacts, forceEmailNames) => {
  return contacts.map(contact => {
    const emailMatched = contact.match(HTMLTagsRegex);
    if (emailMatched) {
      const emailTag = emailMatched.pop();
      const email = emailTag.replace(/[<>]/g, '').toLowerCase();
      const forcedName = forceEmailNames ? forceEmailNames[email] : undefined;
      const name =
        forcedName || contact.slice(0, contact.lastIndexOf('<')).trim();
      return { email, name };
    }
    return { email: contact.toLowerCase(), name: null };
  });
};

module.exports = {
  formContactsRow
};
