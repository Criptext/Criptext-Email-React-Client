/* eslint-env node, jest */

import emailReducer from './../emails';
import * as actions from './../../actions/index';
import file from './../../../public/emails.json';
import { EmailStatus } from '../../utils/const';
const emails = file.emails;

jest.mock('./../../utils/electronInterface');
jest.mock('./../../utils/electronEventInterface');
jest.mock('./../../utils/electronUtilsInterface');

describe('email actions: ', () => {
  function initState(emails) {
    const data = {};
    emails.forEach(element => {
      data[element.id] = element;
    });
    const action = actions.addEmails(data);
    return emailReducer(undefined, action);
  }

  it('Add emails to state', () => {
    expect(initState(emails)).toMatchSnapshot();
  });

  it('Mute email by id', () => {
    const emailId = '1';
    const prevState = initState(emails);
    const action = actions.muteNotifications(emailId);
    const nextState = emailReducer(prevState, action);
    const mutedEmail = nextState.get(emailId);
    expect(mutedEmail.get('isMuted')).toBe(1);
  });

  it('Unsend email by id', () => {
    const emailId = '1';
    const prevState = initState(emails);
    const action = actions.unsendEmailOnSuccess(emailId);
    const nextState = emailReducer(prevState, action);
    const unsentEmail = nextState.get(emailId);
    expect(unsentEmail.get('status')).toBe(EmailStatus.UNSEND);
  });
});
