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
    expect(state).toEqual('I');
  });

  it('not return any capital letters from empty string', () => {
    const string = '';
    const state = utils.getTwoCapitalLetters(string);
    expect(state).toEqual('');
  });

  it('return default string from empty string', () => {
    const string = '';
    const stringDefault = 'A';
    const state = utils.getTwoCapitalLetters(string, stringDefault);
    expect(state).toEqual(stringDefault);
  });

  it('return string in lower case and without spaces', () => {
    const string = 'All Mail';
    const state = utils.toLowerCaseWithoutSpaces(string);
    expect(state).toEqual('allmail');
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

describe('String Utils - Signal Identifiers :', () => {
  it('Should separate recipient and deviceId (ideal case)', () => {
    const identifier = 'julian.1';
    const recipientIdExpected = 'julian';
    const deviceIdExpected = 1;
    const { recipientId, deviceId } = utils.splitSignalIdentifier(identifier);
    expect(recipientId).toEqual(recipientIdExpected);
    expect(deviceId).toEqual(deviceIdExpected);
  });

  it('Should separate recipient and deviceId (complex case)', () => {
    const identifier = 'julian.adams.2';
    const recipientIdExpected = 'julian.adams';
    const deviceIdExpected = 2;
    const { recipientId, deviceId } = utils.splitSignalIdentifier(identifier);
    expect(recipientId).toEqual(recipientIdExpected);
    expect(deviceId).toEqual(deviceIdExpected);
  });
});
