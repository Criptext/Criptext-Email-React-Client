/* eslint-env node, jest */

import {
  validateUsername,
  validateFullname,
  validatePassword,
  validateConfirmPassword,
  validateEmail
} from './../validators';

describe('Validators: ', () => {
  it('Should mark the username as valid (true)', () => {
    const username = 'myusername';
    expect(validateUsername(username)).toMatchSnapshot();
  });

  it('Should mark the username as invalid (false)', () => {
    const username = 'u';
    expect(validateUsername(username)).toMatchSnapshot();
  });

  it('Should mark the fullname as valid (true)', () => {
    const fullname = 'myfullname';
    expect(validateFullname(fullname)).toMatchSnapshot();
  });

  it('Should mark the fullname as invalid (false)', () => {
    const fullname = 'f';
    expect(validateFullname(fullname)).toMatchSnapshot();
  });

  it('Should mark the password as valid (true)', () => {
    const password = '1234';
    expect(validatePassword(password)).toMatchSnapshot();
  });

  it('Should mark the password as invalid (false)', () => {
    const password = 'p';
    expect(validatePassword(password)).toMatchSnapshot();
  });

  it('Should mark the confirmation password as valid (true)', () => {
    const password = '1234';
    const confirmation = '1234';
    expect(validateConfirmPassword(password, confirmation)).toMatchSnapshot();
  });

  it('Should mark the confirmation password as invalid (false)', () => {
    const password = '1234';
    const confirmation = '1235';
    expect(validateConfirmPassword(password, confirmation)).toMatchSnapshot();
  });

  it('Should mark the email as valid (true)', () => {
    const email = 'username@criptext.com';
    expect(validateEmail(email)).toMatchSnapshot();
  });

  it('Should mark the email as invalid (false)', () => {
    const email = 'username.criptext.com';
    expect(validateEmail(email)).toMatchSnapshot();
  });
  it('Should mark the email as invalid (false)', () => {
    const email = '@criptext.com';
    expect(validateEmail(email)).toMatchSnapshot();
  });
  it('Should mark the email as invalid (false)', () => {
    const email = 'username@criptext';
    expect(validateEmail(email)).toMatchSnapshot();
  });
});
