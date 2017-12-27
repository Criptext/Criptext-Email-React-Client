/* eslint-env node, jest */

import emailReducer from '../emails';
import * as actions from '../../actions/index';

describe('email actions: ', () => {
  it('should add emails to state', () => {
    const emails = {
      '1': {
        id: 1,
        subject: 'Test subject 1',
        preview: 'Test content 1',
        content: 'Test content 1'
      },
      '2': {
        id: 2,
        subject: 'Test subject 2',
        preview: 'Test content 2',
        content: 'Test content 2'
      }
    };
    const action = actions.addEmails(emails);
    const state = emailReducer(undefined, action);
    expect(state).toMatchSnapshot();
  });
});
