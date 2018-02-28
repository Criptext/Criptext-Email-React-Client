/* eslint-env node, jest */

import userReducer from './../users';
import { addUsers } from '../../actions/index';
import file from './../../../public/users.json';
import { fromJS } from 'immutable';
const prevUsers = file.users;

jest.mock('../../utils/electronInterface');

describe('User actions:', () => {
  it('Add a new user to state', () => {
    const prevState = fromJS(prevUsers);
    const newUser = {
      '0': {
        id: '0',
        name: 'Test User',
        nickname: 'testuser',
        email: 'testuser@criptext.com'
      }
    };
    const action = addUsers(newUser);
    const state = userReducer(prevState, action);
    expect(state).toMatchSnapshot();
  });
});
