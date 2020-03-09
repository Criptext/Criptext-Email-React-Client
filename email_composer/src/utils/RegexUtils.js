/* eslint no-useless-escape: 0 */
export const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const HTMLTagsRegex = /<[^>]*>?/g;
export const contactsRegex = string => {
  const escaped = escapeRegEx(string);
  return new RegExp(`(^${escaped}| ${escaped})`, 'i');
};
const escapeRegEx = s => {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};
