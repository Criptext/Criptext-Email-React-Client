/* eslint-env node, jest */

import * as utils from './../StringUtils.js';
import { appDomain } from './../const';

jest.mock('./../../utils/ipc');
jest.mock('./../../utils/const');
jest.mock('./../../utils/electronInterface');

describe('string utils:', () => {
  it('remove actions from subject', () => {
    const subject = 'Re: RE: Hello';
    const state = utils.removeActionsFromSubject(subject);
    expect(state).toEqual('Hello');
  });

  it('return two capital letters from string with space', () => {
    const string = 'Criptext info';
    const state = utils.getTwoCapitalLetters(string);
    expect(state).toEqual('CI');
  });

  it('return two capital letters from email address', () => {
    const string = 'info@criptext.com';
    const state = utils.getTwoCapitalLetters(string);
    expect(state).toEqual('IN');
  });

  it('not return any capital letters from empty string', () => {
    const string = '';
    const state = utils.getTwoCapitalLetters(string);
    expect(state).toEqual('');
  });

  it('return string in lower case and without spaces', () => {
    const string = 'All Mail';
    const state = utils.toLowerCaseWithoutSpaces(string);
    expect(state).toEqual('allmail');
  });

  it('return default string from empty string', () => {
    const string = '';
    const stringDefault = 'A';
    const state = utils.getTwoCapitalLetters(string, stringDefault);
    expect(state).toEqual(stringDefault);
  });
});

describe('Criptext Domain :', () => {
  it('Should remove Criptext Domain to Criptext email', () => {
    const email = `erika@${appDomain}`;
    const state = utils.removeAppDomain(email);
    expect(state).toEqual('erika');
  });

  it('Should remove criptext domain to any email', () => {
    const email = 'erika@signal.com';
    const state = utils.removeAppDomain(email);
    expect(state).toEqual(email);
  });
});
