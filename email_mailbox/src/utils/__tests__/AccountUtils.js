/* eslint-env node, jest */

import { compareAccounts } from "../AccountUtils";

jest.mock('./../../utils/electronInterface');
jest.mock('./../../utils/ipc');

describe('Account Utils - ', () => {
  it('Sort accounts array by params: isActive, isLoggedIn and name', () => {
    const unorderedAccounts = [
      { name: 'UserA', isLoggedIn: true, isActive: false },
      { name: 'UserF', isLoggedIn: false, isActive: false },
      { name: 'UserB', isLoggedIn: false, isActive: false },
      { name: 'UserE', isLoggedIn: true, isActive: true },
      { name: 'UserC', isLoggedIn: false, isActive: false },
      { name: 'UserD', isLoggedIn: true, isActive: false },
    ];
    const expectedOrder = [
      { name: 'UserE', isLoggedIn: true, isActive: true },
      { name: 'UserA', isLoggedIn: true, isActive: false },
      { name: 'UserD', isLoggedIn: true, isActive: false },
      { name: 'UserB', isLoggedIn: false, isActive: false },
      { name: 'UserC', isLoggedIn: false, isActive: false },
      { name: 'UserF', isLoggedIn: false, isActive: false }
    ];

    const result = unorderedAccounts.sort(compareAccounts);
    expect(result[0]).toMatchObject(expectedOrder[0]);
    expect(result[1]).toMatchObject(expectedOrder[1]);
    expect(result[2]).toMatchObject(expectedOrder[2]);
    expect(result[3]).toMatchObject(expectedOrder[3]);
    expect(result[4]).toMatchObject(expectedOrder[4]);
    expect(result[5]).toMatchObject(expectedOrder[5]);
  });
});