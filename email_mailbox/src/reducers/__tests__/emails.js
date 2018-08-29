/* eslint-env node, jest */

import emailReducer from './../emails';
import * as actions from './../../actions/index';
import file from './../../../public/emails.json';

jest.mock('./../../utils/electronInterface');
jest.mock('./../../utils/electronEventInterface');
jest.mock('./../../utils/electronUtilsInterface');

const myEmails = file.emails;

function initState(emails) {
  const data = {};
  emails.forEach(element => {
    data[element.id] = element;
  });
  return emailReducer(undefined, actions.addEmails(data));
}

describe('Email actions - ADD_BATCH ', () => {
  it('shoul add emails to state', () => {
    expect(initState(myEmails)).toMatchSnapshot();
  });
});

describe('Email actions - UNSEND: ', () => {
  const emails = [myEmails[0]];

  it('should update email param: content, preview, status, unsendDate by emailId', () => {
    const state = initState(emails);
    const emailId = '1';
    const unsendDate = '2018-08-28T20:14:52.593Z';
    const status = 6;
    const action = actions.unsendEmailOnSuccess(emailId, unsendDate, status);
    const newState = emailReducer(state, action);
    const emailUpdated = newState.get(emailId);
    expect(emailUpdated.toJS()).toMatchObject(
      expect.objectContaining({
        content: '',
        preview: '',
        status,
        unsendDate
      })
    );
  });

  it('should not update email, when emailId not exists in state', () => {
    const state = initState(emails);
    const email = state.get('1');
    const emailId = '10';
    const unsendDate = '2018-08-28T20:14:52.593Z';
    const status = 6;
    const action = actions.unsendEmailOnSuccess(emailId, unsendDate, status);
    const newState = emailReducer(state, action);
    const emailUpdated = newState.get(emailId);
    expect(emailUpdated).toBe(undefined);
    expect(email).toBe(newState.get('1'));
  });
});

describe('email actions: ', () => {
  it('Mute email by id', () => {
    const emailId = '1';
    const prevState = initState(myEmails);
    const action = actions.muteNotifications(emailId);
    const nextState = emailReducer(prevState, action);
    const mutedEmail = nextState.get(emailId);
    expect(mutedEmail.get('isMuted')).toBe(1);
  });
});
