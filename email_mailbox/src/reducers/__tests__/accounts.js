/* eslint-env node, jest */

import accountsReducer from './../accounts';
import * as actions from './../../actions/index';
import file from './../../../public/accounts.json';
const accounts = file.accounts;

jest.mock('./../../utils/ipc');
jest.mock('./../../utils/electronInterface');
jest.mock('./../../utils/electronEventInterface');

describe('Account actions - ADD_BATCH', () => {
  it('should add contacts', () => {
    const data = accounts.reduce(
      (result, element) => ({
        ...result,
        [element.id]: element
      }),
      {}
    );
    const action = actions.addAccounts(data);
    const state = accountsReducer(undefined, action);
    expect(state).toMatchSnapshot();
  });
});

describe('Account actions - UPDATE-ACCOUNTS', () => {
  it('should update: badge', () => {
    const data = [{ id: 2, badge: 1692 }];
    const action = actions.updateAccounts(data);
    const state = accountsReducer(undefined, action);
    expect(state).toMatchSnapshot();
  });
});
