/* eslint-env node, jest */

import userReducer from './../users';
import { addUser } from './../../actions/index';

jest.mock('../../utils/electronInterface');

describe('User actions:', () => {
  it('Add a new user to database, state and localStorage', () => {
    const user = {
      name: 'Test User',
      email: 'test1@criptext.com',
      nickname: 'testuser'
    };
    const action = addUser(user);
    console.log(action);
    const state = userReducer(
      {
        'prevuser@criptext.com': {
          name: 'Previous User',
          email: 'prevuser@criptext.com',
          nickname: 'prevuser'
        }
      },
      action
    );
    console.log(state);
    console.log(localStorage.getItem('sessionId'))
    expect(state).toMatchSnapshot();
  });
});
