/* eslint-env node, jest */

import threadsReducer from '../user';
import * as actions from '../../actions/index';

describe('user actions', () => {
  it('should add users to state', () => {
    const users = {
      '3': {
        id: 3,
        name: 'test 3',
        email: 'test3@criptext.com'
      },
      '1': {
        id: 1,
        name: 'test 1',
        email: 'test1@criptext.com'
      }
    };
    const action = actions.addUsers(users);
    const state = threadsReducer(null, action);
    expect(state).toMatchSnapshot();
  });

  it('should add user to state', () => {
    const user = {
      id: 1,
      name: 'test 1',
      email: 'test1@criptext.com'
    };
    const action = actions.addUser(user);
    const state = threadsReducer(
      {
        '3': {
          id: 3,
          name: 'test 3',
          email: 'test3@criptext.com'
        }
      },
      action
    );
    expect(state).toMatchSnapshot();
  });
});
