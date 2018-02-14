export const removeActionsFromSubject = subject => {
  const actions = ['Re:', 'RE:'];
  return deleteSubstringsFirstPosition(actions, subject);
};

export const deleteSubstringsFirstPosition = (substrings, subject) => {
  const substringToDelete = hasAnySubstring(substrings, subject);
  if (substringToDelete) {
    subject = deleteSubstring(substringToDelete, subject);
    return deleteSubstringsFirstPosition(substrings, subject);
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
