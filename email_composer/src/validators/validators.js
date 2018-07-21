export const requiredMinLength = {
  password: 4
};

const requiredMaxLength = {
  password: 255
};

const checkRequired = field => {
  return field !== undefined;
};
const checkminLength = (field, minlength) => {
  return field.length >= minlength;
};
const checkMaxLength = (field, maxLength) => {
  return field.length < maxLength;
};
const checkMatch = (field1, field2) => {
  return field1 === field2;
};

export const validatePassword = field => {
  return (
    checkRequired(field) &&
    checkminLength(field, requiredMinLength.password) &&
    checkMaxLength(field, requiredMaxLength.password)
  );
};

export const validateConfirmPassword = (field1, field2) => {
  const required = checkRequired(field1) && checkRequired(field2);
  const length =
    checkminLength(field1, requiredMinLength.password) &&
    checkminLength(field2, requiredMinLength.password) &&
    checkMaxLength(field1, requiredMaxLength.password) &&
    checkMaxLength(field2, requiredMaxLength.password);
  const match = checkMatch(field1, field2);
  return required && length && match;
};
