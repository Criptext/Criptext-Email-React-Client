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

export const pasteSplit = data => {
  const separators = [
    ',',
    ';',
    '\\(',
    '\\)',
    '\\*',
    '/',
    ':',
    '\\?',
    '\n',
    '\r'
  ];
  return data.split(new RegExp(separators.join('|'))).map(d => d.trim());
};

export const getTwoCapitalLetters = string => {
  const strings = string.split(' ');
  if (strings.length === 1) {
    return strings[0].slice(0, 2).toUpperCase();
  }
  return (strings[0].charAt(0) + strings[1].charAt(0)).toUpperCase();
};

export const replaceAllOccurrences = (text, search, replacement) => {
  return text.split(search).join(replacement);
};
