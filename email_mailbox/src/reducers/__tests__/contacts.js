/* eslint-env node, jest */

import threadsReducer from '../contacts';
import * as actions from '../../actions/index';

jest.mock('../../utils/electronInterface');

describe('user actions', () => {
  it('should add users to state', () => {
    const contacts = {
      'test3@criptext.com': {
        name: 'test 3',
        email: 'test3@criptext.com'
      },
      'test1@criptext.com': {
        name: 'test 1',
        email: 'test1@criptext.com'
      }
    };
    const action = actions.addContacts(contacts);
    const state = threadsReducer(null, action);
    expect(state).toMatchSnapshot();
  });

  it('should add user to state', () => {
    const contact = {
      name: 'test 1',
      email: 'test1@criptext.com'
    };
    const action = actions.addContact(contact);
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
