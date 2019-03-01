/* eslint-env node, jest */

import {
  validateUsername,
  validateFullname,
  validatePassword,
  validateConfirmPassword,
  validateEmail
} from './../validators';

jest.mock('./../../utils/electronInterface');

describe('Validate Username: ', () => {
  const fn = validateUsername;

  it('Should return valid if it receives a valid username', () => {
    const username = 'bob';
    expect(fn(username)).toBe(true);
  });

  it('Should return error if it receives less than 3 characters', () => {
    const username = 'un';
    expect(fn(username)).toBe(false);
  });

  it('Should return error if it receives spaces in middle', () => {
    const username = 'user name';
    expect(fn(username)).toBe(false);
  });

  it('Should return error if it receives invalid characters', () => {
    const username = 'u$3rnAme';
    expect(fn(username)).toBe(false);
  });

  it('Should return error if username starts with dot', () => {
    const username = '.username';
    expect(fn(username)).toBe(false);
  });

  it('Should return valid if it receives dots, dashes or low dashes in username', () => {
    const username = 'usr-name.valid_1';
    expect(fn(username)).toBe(true);
  });
});

describe('Validate Fullname:', () => {
  const fn = validateFullname;

  it('Should return valid if fullname has enough characters', () => {
    const fullname = 'myfullname';
    expect(fn(fullname)).toBe(true);
  });

  it('Should return error if the fullname has very few characters', () => {
    const fullname = '';
    expect(fn(fullname)).toBe(false);
  });
});

describe('Validate Password:', () => {
  const fn = validatePassword;

  it('Returns true if the password has enough characters.', () => {
    const password = '123456789';
    expect(fn(password)).toBe(true);
  });

  it('Returns false if the password has very few characters.', () => {
    const password = '123';
    expect(fn(password)).toBe(false);
  });
});

describe('Validate Password confirmation:', () => {
  const fn = validateConfirmPassword;

  it('Returns true if the password and its confirmation have enough characters and they are equals.', () => {
    const password = '123456789';
    const confirmation = '123456789';
    expect(fn(password, confirmation)).toBe(true);
  });

  it('Returns false if the password or its confirmation have very few characters.', () => {
    const password = '1234';
    const confirmation = '1234';
    expect(fn(password, confirmation)).toBe(false);
  });
  it('Returns false if the password or its confirmation are not equals.', () => {
    const password = '123456789';
    const confirmation = '123456780';
    expect(fn(password, confirmation)).toBe(false);
  });
});

describe('Validate Email address: ', () => {
  const fn = validateEmail;
  it('Should return valid if it receives a valid address', () => {
    const email = 'username@criptext.com';
    expect(fn(email)).toBe(true);
  });
  it('Should return error if it receives a angular brackets and spaces', () => {
    const email = 'Fullname <username@criptext.com>';
    expect(fn(email)).toBe(false);
  });
  it('Returns false if the email has a invalid format (without @)', () => {
    const email = 'username.criptext.com';
    expect(fn(email)).toBe(false);
  });
  it('Returns false if the email has a invalid format (no username before @)', () => {
    const email = '@criptext.com';
    expect(fn(email)).toBe(false);
  });
  it('Returns false if the email has a invalid format (without top-level domain)', () => {
    const email = 'username@criptext';
    expect(fn(email)).toBe(false);
  });
});
