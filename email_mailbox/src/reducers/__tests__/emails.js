/* eslint-env node, jest */

import emailReducer from './../emails';
import * as actions from './../../actions/index';
import file from './../../../public/emails.json';

jest.mock('./../../utils/ipc');
jest.mock('./../../utils/electronInterface');
jest.mock('./../../utils/electronEventInterface');

const myEmails = file.emails;

const initState = emails => {
  const data = {};
  emails.forEach(element => {
    data[element.id] = element;
  });
  return emailReducer(undefined, actions.addEmails(data));
};

describe('Email actions - ADD_BATCH ', () => {
  it('shoul add emails to state', () => {
    expect(initState(myEmails)).toMatchSnapshot();
  });
});

describe('Email actions - UNSEND: ', () => {
  const emails = [myEmails[0]];

  it('should update email with param: content, preview, status, unsendDate by emailId', () => {
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

describe('Email actions - UPDATE ', () => {
  it('should update content, with params: id and content', () => {
    const id = '1';
    const content = 'Text changed';
    const prevState = initState(myEmails);
    const action = actions.updateEmailOnSuccess({ id, content });
    const nextState = emailReducer(prevState, action);
    const emailUpdated = nextState.get(id);
    expect(emailUpdated.get('content')).toBe(content);
  });

  it('should not update content, without param: id', () => {
    const id = null;
    const content = 'Text changed';
    const prevState = initState(myEmails);
    const action = actions.updateEmailOnSuccess({ id, content });
    const nextState = emailReducer(prevState, action);
    expect(prevState).toBe(nextState);
  });

  it('should not update content, when id does not exists', () => {
    const id = '10';
    const content = 'Text changed';
    const prevState = initState(myEmails);
    const action = actions.updateEmailOnSuccess({ id, content });
    const nextState = emailReducer(prevState, action);
    expect(prevState).toBe(nextState);
  });
});

describe('Email actions - MUTE ', () => {
  it('Mute email by id', () => {
    const emailId = '1';
    const prevState = initState(myEmails);
    const action = actions.muteNotifications(emailId);
    const nextState = emailReducer(prevState, action);
    const mutedEmail = nextState.get(emailId);
    expect(mutedEmail.get('isMuted')).toBe(1);
  });
});

describe('Email actions - REMOVE_EMAILS ', () => {
  it('should not remove emails from state if param is undefined', () => {
    const state = initState(myEmails);
    const emailIds = undefined;
    const action = actions.removeEmailsOnSuccess(emailIds);
    const nextState = emailReducer(state, action);
    expect(nextState.toJS()).toMatchObject(
      expect.objectContaining({
        '1': expect.any(Object),
        '2': expect.any(Object)
      })
    );
  });

  it('should remove email from state only if param is string', () => {
    const state = initState(myEmails);
    const emailIds = ['1', null, 3];
    const action = actions.removeEmailsOnSuccess(emailIds);
    const nextState = emailReducer(state, action);
    expect(nextState.get('1')).toBeUndefined();
    expect(nextState.toJS()).toMatchObject(
      expect.objectContaining({
        '2': expect.any(Object),
        '3': expect.any(Object)
      })
    );
  });

  it('should remove emails from state', () => {
    const state = initState(myEmails);
    const emailIds = ['1', '3'];
    const action = actions.removeEmailsOnSuccess(emailIds);
    const nextState = emailReducer(state, action);
    expect(nextState.get('1')).toBeUndefined();
    expect(nextState.get('3')).toBeUndefined();
  });
});
