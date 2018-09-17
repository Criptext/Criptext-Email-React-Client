const { appDomain } = require('./const');
const { HTMLTagsRegex } = require('./RegexUtils');

const removeDomainFromEmail = (email, domain) => {
  return email.replace(`@${domain}`, '');
};

/* To export
   ----------------------------- */
const cleanHTML = string => {
  const stringHTMLcontentRemoved = string
    .replace(/<style[^>]*>[^>]*<\/style>/, '')
    .replace(/<script[^>]*>[^>]*<\/script>/, '')
    .replace(/&nbsp;/, ' ');
  return removeHTMLTags(stringHTMLcontentRemoved);
};

const removeAppDomain = email => {
  return removeDomainFromEmail(email, appDomain);
};

const removeHTMLTags = string => {
  const stringHTMLTagRemoved = string.replace(HTMLTagsRegex, ' ');
  return stringHTMLTagRemoved.replace(/\s\s+/g, ' ').trim();
};

module.exports = {
  cleanHTML,
  removeAppDomain,
  removeHTMLTags
};
