const { appDomain } = require('./const');
const { HTMLTagsRegex } = require('./RegexUtils');
const os = require('os');

const removeDomainFromEmail = (email, domain) => {
  return email.replace(`@${domain}`, '');
};

/* To export
   ----------------------------- */
const cleanHTML = string => {
  const stringHTMLcontentRemoved = string
    .replace(/<style[^>]*>[^>]*<\/style>/g, '')
    .replace(/<script[^>]*>[^>]*<\/script>/g, '')
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

const getComputerName = () => {
  const hostname = os.hostname();
  const deviceName = hostname.split('.')[0];
  return deviceName.split('-').join(' ');
};

module.exports = {
  cleanHTML,
  removeAppDomain,
  removeHTMLTags,
  getComputerName
};
