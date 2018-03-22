import { HTMLTagsRegex } from './RegexUtils';
import { appDomain } from './const';

export const removeActionsFromSubject = subject => {
  const actions = ['Re:', 'RE:'];
  return deletePrefixingSubstrings(actions, subject);
};

export const deletePrefixingSubstrings = (substrings, subject) => {
  const substringToDelete = hasAnySubstring(substrings, subject);
  if (substringToDelete) {
    subject = deleteSubstring(substringToDelete, subject);
    return deletePrefixingSubstrings(substrings, subject);
  }
  return subject;
};

const hasAnySubstring = (substrings, string) => {
  return substrings.find(substring => {
    return string.indexOf(substring) === 0;
  });
};

const deleteSubstring = (substring, string) => {
  return string.replace(substring, '').trim();
};

export const removeAppDomain = email => {
  return removeDomainFromEmail(email, appDomain);
};

const removeDomainFromEmail = (email, domain) => {
  return email.replace(`@${domain}`, '');
};

export const removeHTMLTags = string => {
  return string.replace(HTMLTagsRegex, '');
};

export const getTwoCapitalLetters = string => {
  const strings = string.split(' ');
  if (strings.length === 1) {
    return strings[0].slice(0, 2).toUpperCase();
  }
  return (strings[0].charAt(0) + strings[1].charAt(0)).toUpperCase();
};
