/* eslint-env node, jest */

import {
  validateUsername,
  validateFullname,
  validatePassword,
  validateConfirmPassword,
  validateEmail,
  checkUsernameAvailable
} from './../validators';

jest.mock('./../../utils/electronInterface');
import { prevUsername } from './../../utils/__mocks__/electronInterface';

describe('Validate username:', () => {
  const fn = validateUsername;

  it('Returns true if the username has enough characters.', () => {
    const username = 'bob';
    expect(fn(username)).toBe(true);
  });

  it('Returns false if the username has very few characters.', () => {
    const username = 'un';
    expect(fn(username)).toBe(false);
  });

  it('Returns false if the username is already used.', async () => {
    const isAvailable = await checkUsernameAvailable(prevUsername);
    expect(isAvailable).toBe(false);
  });

  it('Returns true if the username is available.', async () => {
    const username = 'new' + prevUsername;
    const isAvailable = await checkUsernameAvailable(username);
    expect(isAvailable).toBe(true);
  });
});

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

describe('Validate email:', () => {
  const fn = validateEmail;

  it('Returns true if the email has a valid format', () => {
    const email = 'username@criptext.com';
    expect(fn(email)).toBe(true);
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
