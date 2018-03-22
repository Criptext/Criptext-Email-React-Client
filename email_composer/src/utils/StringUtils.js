import { HTMLTagsRegex } from './RegexUtils';
import { appDomain } from './const';

export const removeAppDomain = email => {
  return removeDomainFromEmail(email, appDomain);
};

const removeDomainFromEmail = (email, domain) => {
  return email.replace(`@${domain}`, '');
};

export const removeHTMLTags = string => {
  return string.replace(HTMLTagsRegex, '');
};
