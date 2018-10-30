/* eslint-env node, jest */

import {
  validateFullname,
  validatePassword,
  validateConfirmPassword
} from './../validators';

jest.mock('./../../utils/const');
jest.mock('./../../utils/electronInterface');

describe('Validate fullname:', () => {
  const fn = validateFullname;
  it('Returns true if the fullname has enough characters.', () => {
    const fullname = 'myfullname';
    expect(fn(fullname)).toBe(true);
  });
  it('Returns false if the fullname has very few characters.', () => {
    const fullname = '';
    expect(fn(fullname)).toBe(false);
  });
});

describe('Validate password:', () => {
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

describe('Validate password confirmation:', () => {
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
