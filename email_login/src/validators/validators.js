import validator from 'validator';
import { usernameRegex } from './../utils/RegexUtils';
import {
  checkAvailableUsername,
  requiredMinLength,
  requiredMaxLength
} from './../utils/electronInterface';

const checkFormat = (string, regex) => {
  return regex.test(string);
};
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

export const validateUsername = username => {
  return (
    checkRequired(username) &&
    checkminLength(username, requiredMinLength.username) &&
    checkMaxLength(username, requiredMaxLength.username) &&
    checkFormat(username, usernameRegex)
  );
};

export const checkUsernameAvailable = async username => {
  const isValidated = validateUsername(username);
  if (!isValidated) return false;

  const res = await checkAvailableUsername(username);
  return res.status === 200;
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

export const validateAcceptTerms = field => {
  return field === true;
};

export const validateEmail = email => {
  return validator.isEmail(email);
};
