/* eslint-env node, jest */

import {
  validateUsername,
  validateFullname,
  validatePassword,
  validateConfirmPassword,
  validateEmail,
  requiredLength
} from './../validators';

describe('Validate username:', () => {
  const fn = validateUsername;
  const length = requiredLength.username;
  const validMessage =
    'Returns true if the username has more than ' +
    String(length) +
    ' characters';
  const invalidMessage =
    'Returns false if the username has less than ' +
    String(length + 1) +
    ' characters';

  it(validMessage, () => {
    const username = 'myusername';
    expect(fn(username)).toBe(true);
  });

  it(invalidMessage, () => {
    const username = 'un';
    expect(fn(username)).toBe(false);
  });
});

describe('Validate fullname:', () => {
  const fn = validateFullname;
  const length = requiredLength.fullname;
  const validMessage =
    'Returns true if the fullname has more than ' +
    String(length) +
    ' characters';
  const invalidMessage =
    'Returns false if the fullname has less than ' +
    String(length + 1) +
    ' characters';

  it(validMessage, () => {
    const fullname = 'myfullname';
    expect(fn(fullname)).toBe(true);
  });

  it(invalidMessage, () => {
    const fullname = 'f';
    expect(fn(fullname)).toBe(false);
  });
});

describe('Validate password:', () => {
  const fn = validatePassword;
  const length = requiredLength.password;
  const validMessage =
    'Returns true if the password has more than ' +
    String(length) +
    ' characters';
  const invalidMessage =
    'Returns false if the password has less than ' +
    String(length + 1) +
    ' characters';

  it(validMessage, () => {
    const password = '1234';
    expect(fn(password)).toBe(true);
  });

  it(invalidMessage, () => {
    const password = '0';
    expect(fn(password)).toBe(false);
  });
});

describe('Validate password confirmation:', () => {
  const fn = validateConfirmPassword;
  const length = requiredLength.password;
  const validMessage =
    'Returns true if the password and its confirmation have more than ' +
    String(length) +
    ' characters and they are equals.';
  const invalidMessage =
    'Returns false if the password or its confirmation have less than ' +
    String(length + 1) +
    ' characters or they are not equals.';

  it(validMessage, () => {
    const password = '1234';
    const confirmation = '1234';
    expect(fn(password, confirmation)).toBe(true);
  });

  it(invalidMessage, () => {
    const password = '1234';
    const confirmation = '123';
    expect(fn(password, confirmation)).toBe(false);
  });
  it(invalidMessage, () => {
    const password = '1234';
    const confirmation = '1235';
    expect(fn(password, confirmation)).toBe(false);
  });
});

describe('Validate email:', () => {
  const fn = validateEmail;
  const validMessage = 'Returns true if the email has a valid format';
  const invalidMessage = 'Returns false if the email has a invalid format';

  it(validMessage, () => {
    const email = 'username@criptext.com';
    expect(fn(email)).toBe(true);
  });

  it(invalidMessage, () => {
    const email = 'username.criptext.com';
    expect(fn(email)).toBe(false);
  });
  it(invalidMessage, () => {
    const email = '@criptext.com';
    expect(fn(email)).toBe(false);
  });
  it(invalidMessage, () => {
    const email = 'username@criptext';
    expect(fn(email)).toBe(false);
  });
});
