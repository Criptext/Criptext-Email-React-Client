import { appDomain } from './const';
import { HTMLTagsRegex } from './RegexUtils';

const deletePrefixingSubstrings = (substrings, subject) => {
  const substringToDelete = hasAnySubstring(substrings, subject);
  if (substringToDelete) {
    subject = deleteSubstring(substringToDelete, subject);
    return deletePrefixingSubstrings(substrings, subject);
  }
  return subject;
};

const deleteSubstring = (substring, string) => {
  return string.replace(substring, '').trim();
};

const hasAnySubstring = (substrings, string) => {
  return substrings.find(substring => {
    return string.indexOf(substring) === 0;
  });
};

const removeDomainFromEmail = (email, domain) => {
  return email.replace(`@${domain}`, '');
};

export const convertToHumanSize = (bytes, si, decimals) => {
  const thresh = si ? 1000 : 1024;
  const fixedAt = decimals !== undefined ? decimals : 1;
  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }
  const units = si
    ? ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  do {
    bytes /= thresh;
    ++u;
  } while (Math.abs(bytes) >= thresh && u < units.length - 1);
  return bytes.toFixed(fixedAt) + ' ' + units[u];
};

export const cleanHTML = string => {
  const stringHTMLcontentRemoved = string
    .replace(/<style[^>]*>[^>]*<\/style>/g, '')
    .replace(/<script[^>]*>[^>]*<\/script>/g, '')
    .replace(/&[a-z]{2,5};/g, ' ');
  return removeHTMLTags(stringHTMLcontentRemoved);
};

export const removeHTMLTags = string => {
  const stringHTMLTagRemoved = string.replace(HTMLTagsRegex, ' ');
  return stringHTMLTagRemoved.replace(/\s\s+/g, ' ').trim();
};

export const getTwoCapitalLetters = (string, defaultString) => {
  const strings = string.split(' ');
  if (strings.length === 1 && strings[0].length === 0) {
    return defaultString || '';
  } else if (strings.length === 1) {
    return strings[0].charAt(0).toUpperCase();
  }
  return (strings[0].charAt(0) + strings[1].charAt(0)).toUpperCase();
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

export const replaceAllOccurrences = (text, search, replacement) => {
  return text.split(search).join(replacement);
};

export const removeActionsFromSubject = subject => {
  const actions = ['Re:', 'RE:', 'Fw:', 'FW:', 'Fwd:', 'FWD:'];
  return deletePrefixingSubstrings(actions, subject);
};

export const removeAppDomain = email => {
  return removeDomainFromEmail(email, appDomain);
};

export const splitSignalIdentifier = identifier => {
  const parts = identifier.split('.');
  const deviceId = Number(parts.pop());
  const recipientId = parts.join('.');
  return { recipientId, deviceId };
};
