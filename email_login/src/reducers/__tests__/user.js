/* eslint-env node, jest */

import userReducer from './../users';
import { addUsers } from '../../actions/index';
import { fromJS } from 'immutable';

jest.mock('../../utils/electronInterface');

describe('User actions:', () => {
  it('Add a new user to state', () => {
    const prevState = fromJS({
      '0': {
        id: '0',
        name: 'Previous User',
        nickname: 'prevuser',
        email: 'prevuser@criptext.com'
      }
    });
    const newUser = {
      '1': {
        id: '1',
        name: 'Test User',
        nickname: 'testuser',
        email: 'test1@criptext.com'
      }
    };
    const action = addUsers(newUser);
    const state = userReducer(prevState, action);
    expect(state).toMatchSnapshot();
  });
});
