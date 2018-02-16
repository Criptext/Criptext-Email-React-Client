import validator from 'validator';

export const requiredLength = {
  username: 2,
  fullname: 2,
  password: 2
};

const checkRequired = field => {
  return field !== undefined;
};
const checkminLength = (field, length) => {
  return field.length > length;
};
const checkMatch = (field1, field2) => {
  return field1 === field2;
};

export const validateUsername = username => {
  return (
    checkRequired(username) && checkminLength(username, requiredLength.username)
  );
};

export const validateFullname = fullname => {
  return (
    checkRequired(fullname) && checkminLength(fullname, requiredLength.fullname)
  );
};

export const validatePassword = field => {
  return checkRequired(field) && checkminLength(field, requiredLength.password);
};

export const validateConfirmPassword = (field1, field2) => {
  const required = checkRequired(field1) && checkRequired(field2);
  const length =
    checkminLength(field1, requiredLength.password) &&
    checkminLength(field2, requiredLength.password);
  const match = checkMatch(field1, field2);
  return required && length && match;
};

export const validateAcceptTerms = field => {
  return field === true;
};

export const validateEmail = email => {
  return validator.isEmail(email);
};
