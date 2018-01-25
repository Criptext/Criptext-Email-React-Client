/* eslint-env node, jest */

import threadsReducer from '../user';
import * as actions from '../../actions/index';

jest.mock('../../utils/electronInterface');

describe('user actions', () => {
  it('should add users to state', () => {
    const users = {
      'test3@criptext.com': {
        name: 'test 3',
        email: 'test3@criptext.com'
      },
      'test1@criptext.com': {
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
      name: 'test 1',
      email: 'test1@criptext.com'
    };
    const action = actions.addUser(user);
    const state = threadsReducer(
      {
        'test3@criptext.com': {
          name: 'test 3',
          email: 'test3@criptext.com'
        }
      },
      action
    );
    expect(state).toMatchSnapshot();
  });
});
