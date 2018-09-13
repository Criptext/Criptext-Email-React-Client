const { appDomain } = require('./const');
const { HTMLTagsRegex } = require('./RegexUtils');

const removeDomainFromEmail = (email, domain) => {
  return email.replace(`@${domain}`, '');
};

/* To export
   ----------------------------- */
const removeAppDomain = email => {
  return removeDomainFromEmail(email, appDomain);
};

const removeHTMLTags = string => {
  const stringHTMLTagRemoved = string.replace(HTMLTagsRegex, ' ');
  return stringHTMLTagRemoved.replace(/\s\s+/g, ' ').trim();
};

module.exports = {
  removeAppDomain,
  removeHTMLTags
};
