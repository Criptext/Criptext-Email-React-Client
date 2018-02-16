/* eslint-env node, jest */

import userReducer from '../user';
import { addUser } from '../../actions/index';

jest.mock('../../utils/electronInterface');

describe('user actions', () => {
  it('Add a new user to state', () => {
    const user = {
      name: 'Testuser',
      email: 'test1@criptext.com'
    };
    const action = addUser(user);
    const state = userReducer(
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
