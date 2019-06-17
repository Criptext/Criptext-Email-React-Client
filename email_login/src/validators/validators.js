import isemail from 'isemail';
import { usernameRegex } from './../utils/RegexUtils';

const requiredMinLength = {
  username: 3,
  fullname: 1,
  password: 8
};

const requiredMaxLength = {
  username: 16,
  fullname: 255,
  password: 255
};

const checkFormat = (string, regex) => {
  return regex.test(string);
};
const hasLengthBetween = (str, minLen, maxLen) =>
  str.length >= minLen && str.length <= maxLen;

export const validateUsername = username =>
  username &&
  hasLengthBetween(
    username,
    requiredMinLength.username,
    requiredMaxLength.username
  ) &&
  checkFormat(username, usernameRegex);

export const validateFullname = fullname =>
  !!fullname &&
  hasLengthBetween(
    fullname,
    requiredMinLength.fullname,
    requiredMaxLength.fullname
  );

export const validatePassword = field =>
  field &&
  hasLengthBetween(
    field,
    requiredMinLength.password,
    requiredMaxLength.password
  );

export const validateEnterprisePassword = field =>
  field &&
  hasLengthBetween(
    field,
    requiredMinLength.password,
    requiredMaxLength.password
  );

export const validateConfirmPassword = (field1, field2) =>
  field1 && field2 && validatePassword(field1) && field1 === field2;

export const validateAcceptTerms = field => {
  return field === true;
};

export const validateEmail = email =>
  isemail.validate(email, { minDomainAtoms: 2 });
