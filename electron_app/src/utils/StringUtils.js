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
  return string.replace(HTMLTagsRegex, '');
};

module.exports = {
  removeAppDomain,
  removeHTMLTags
};
