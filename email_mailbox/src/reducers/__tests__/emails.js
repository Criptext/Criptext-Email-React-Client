/* eslint-env node, jest */

import emailReducer from './../emails';
import * as actions from './../../actions/index';
import file from './../../../public/emails.json';
const emails = file.emails;

jest.mock('./../../utils/electronInterface');
jest.mock('./../../utils/electronEventInterface');

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

  it('Mute email by index', () => {
    const indexToMute = '1';
    const prevState = initState(emails);
    const action = actions.muteNotifications(indexToMute);
    const nextState = emailReducer(prevState, action);
    expect(nextState).toMatchSnapshot();
  });
});
