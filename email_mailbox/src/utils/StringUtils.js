import { appDomain } from './const';

export const convertToHumanSize = (bytes, si) => {
  const thresh = si ? 1000 : 1024;
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
  return bytes.toFixed(1) + ' ' + units[u];
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

export const getTwoCapitalLetters = (string, defaultString) => {
  const strings = string.split(' ');
  if (strings.length === 1 && strings[0].length === 0) {
    return defaultString || '';
  } else if (strings.length === 1) {
    return strings[0].slice(0, 2).toUpperCase();
  }
  return (strings[0].charAt(0) + strings[1].charAt(0)).toUpperCase();
};

export const removeActionsFromSubject = subject => {
  const actions = ['Re:', 'RE:'];
  return deletePrefixingSubstrings(actions, subject);
};

export const removeAppDomain = email => {
  return removeDomainFromEmail(email, appDomain);
};

const removeDomainFromEmail = (email, domain) => {
  return email.replace(`@${domain}`, '');
};

export const replaceAllOccurrences = (text, search, replacement) => {
  return text.split(search).join(replacement);
};

export const toLowerCaseWithoutSpaces = string => {
  return string.toLowerCase().replace(/\s/g, '');
};

export const toCapitalize = (string, eachWord) => {
  if (!eachWord) {
    return string.replace(/\b\w/g, firstLetter => firstLetter.toUpperCase());
  }
  return string
    .split(' ')
    .map(word =>
      word.replace(/\b\w/g, firstLetter => firstLetter.toUpperCase())
    )
    .join(' ');
};

export const splitSignalIdentifier = identifier => {
  const parts = identifier.split('.');
  const deviceId = Number(parts.pop());
  const recipientId = parts.join('.');
  return { recipientId, deviceId };
};
