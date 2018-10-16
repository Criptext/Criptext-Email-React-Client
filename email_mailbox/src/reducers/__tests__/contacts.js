/* eslint-env node, jest */

import contactsReducer from './../contacts';
import * as actions from './../../actions/index';
import file from './../../../public/contacts.json';
const contacts = file.contacts;

jest.mock('./../../utils/const');
jest.mock('./../../utils/electronInterface');
jest.mock('./../../utils/electronEventInterface');
jest.mock('./../../utils/electronUtilsInterface');

describe('contacts actions', () => {
  it('should add contacts', () => {
    const data = contacts.reduce(
      (result, element) => ({
        ...result,
        [element.id]: element
      }),
      {}
    );
    const action = actions.addContacts(data);
    const state = contactsReducer(undefined, action);
    expect(state).toMatchSnapshot();
  });
});
