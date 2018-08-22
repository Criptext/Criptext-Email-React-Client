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

export const removeActionsFromSubject = subject => {
  const actions = ['Re:', 'RE:', 'Fw:', 'FW:', 'Fwd:', 'FWD:'];
  return deletePrefixingSubstrings(actions, subject);
};

const deletePrefixingSubstrings = (substrings, subject) => {
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
