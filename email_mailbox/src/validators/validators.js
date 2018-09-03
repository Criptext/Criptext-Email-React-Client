import {
  myAccount,
  requiredMinLength,
  requiredMaxLength
} from './../utils/electronInterface';
import { matchOwnEmail } from '../utils/ContactUtils';
import { emailRegex } from '../utils/RegexUtils';

const checkRequired = string => {
  return string !== undefined;
};
const checkminLength = (string, minlength) => {
  return string.length >= minlength;
};
const checkMaxLength = (string, maxLength) => {
  return string.length < maxLength;
};
const checkMatch = (string1, string2) => {
  return string1 === string2;
};

export const validateFullname = fullname => {
  return (
    checkRequired(fullname) &&
    checkminLength(fullname, requiredMinLength.fullname) &&
    checkMaxLength(fullname, requiredMaxLength.fullname)
  );
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

export const validateRecoveryEmail = email => {
  const required = checkRequired(email);
  const isValidAddress = emailRegex.test(email);
  const isOwnEmail = matchOwnEmail(myAccount.recipientId, email);
  return required && isValidAddress && !isOwnEmail;
};
