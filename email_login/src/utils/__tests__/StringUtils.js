/* eslint-env node, jest */

import { censureEmailAddress, replaceCharacters } from './../StringUtils';

describe('Censure email address: ', () => {
  it('Should censure all email address', () => {
    const email = 'testemail@another.domain.level.com';
    const expected = 't********@a******************l.com';
    const censoredEmail = censureEmailAddress(email);
    expect(censoredEmail).toEqual(expected);
  });
});

describe('Replace characters in string ', () => {
  it('Should replace all string. Param type: String', () => {
    const initialString = 'thisisarandomstringtoreplace';
    const expectedString = '****************************';
    const exclude = 'none';
    const character = '*';
    const replacedString = replaceCharacters(initialString, exclude, character);
    expect(replacedString).toEqual(expectedString);
  });

  it('Should not replace string. Param type: String', () => {
    const initialString = 'thisisarandomstringtoreplace';
    const expectedString = 'thisisarandomstringtoreplace';
    const exclude = 'all';
    const character = '*';
    const replacedString = replaceCharacters(initialString, exclude, character);
    expect(replacedString).toEqual(expectedString);
  });

  it('Should replace some positions in string. Param type: Array', () => {
    const initialString = 'thisisarandomstringtoreplace';
    const expectedString = 't**************************e';
    const exclude = [0, -1];
    const character = '*';
    const replacedString = replaceCharacters(initialString, exclude, character);
    expect(replacedString).toEqual(expectedString);
  });
});
