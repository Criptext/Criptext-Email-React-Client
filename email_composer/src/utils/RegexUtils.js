export const emailRegex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;
export const HTMLTagsRegex = /<[^>]*>?/g;
export const contactsRegex = string =>
  new RegExp(`(^${string}| ${string})`, 'i');
