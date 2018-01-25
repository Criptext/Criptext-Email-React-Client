/* eslint-env node, jest */

import emailReducer from '../emails';
import * as actions from '../../actions/index';
import file from './../../../public/emails.json';
const emails = file.emails;

jest.mock('../../utils/electronInterface');

describe('email actions: ', () => {
  it('should add emails to state', () => {
    const data = {};
    emails.forEach(element => {
      data[element.id] = element;
    });
    const action = actions.addEmails(data);
    const state = emailReducer(undefined, action);
    expect(state).toMatchSnapshot();
  });
});
