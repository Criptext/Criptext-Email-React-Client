/* eslint-env node, jest */

import emailReducer from './../emails';
import * as actions from './../../actions/index';
import file from './../../../public/emails.json';

jest.mock('./../../utils/const');
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

  it('should update email with param: content, preview, status, unsentDate by emailId', () => {
    const state = initState(emails);
    const emailId = '1';
    const unsentDate = '2018-08-28T20:14:52.593Z';
    const status = 6;
    const action = actions.unsendEmailOnSuccess(emailId, unsentDate, status);
    const newState = emailReducer(state, action);
    const emailUpdated = newState.get(emailId);
    expect(emailUpdated.toJS()).toMatchObject(
      expect.objectContaining({
        content: '',
        preview: '',
        status,
        unsentDate
      })
    );
  });

  it('should not update email, when emailId not exists in state', () => {
    const state = initState(emails);
    const email = state.get('1');
    const emailId = '10';
    const unsentDate = '2018-08-28T20:14:52.593Z';
    const status = 6;
    const action = actions.unsendEmailOnSuccess(emailId, unsentDate, status);
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

describe('Email actions - ADD LABEL ', () => {
  it('Add email label id to emails', () => {
    const prevState = initState(myEmails);
    const emailRaw = myEmails[0];
    const action = actions.addEmailLabels([emailRaw], [2]);
    const nextState = emailReducer(prevState, action);
    const newEmail = nextState.get('1');
    expect(newEmail.get('labelIds')).toContain(2);
  });
});

describe('Email actions - DELETE LABEL', () => {
  it('Delete email label id from emails', () => {
    const prevState = initState(myEmails);
    const emailRaw = myEmails[1];
    const action = actions.removeEmailLabels([emailRaw], [2]);
    const nextState = emailReducer(prevState, action);
    const newEmail = nextState.get('2');
    expect(newEmail.get('labelIds')).not.toContain(2);
  });
});
