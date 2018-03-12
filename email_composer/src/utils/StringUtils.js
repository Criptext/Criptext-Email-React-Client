import { HTMLTagsRegex } from './RegexUtils';

export const removeCriptextDomain = email => {
  return removeDomainFromEmail(email, 'criptext.com');
};

const removeDomainFromEmail = (email, domain) => {
  return email.replace(`@${domain}`, '');
};

export const removeHTMLTags = string => {
  return string.replace(HTMLTagsRegex, '');
};
