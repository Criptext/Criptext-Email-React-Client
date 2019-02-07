/* eslint-env node, jest */
import { contactsRegex } from '../RegexUtils';

const contacts = [
  'User Test1',
  'New Test 1',
  'user1@criptext.com',
  'New User2',
  'user 3',
  'newuser@criptext.com'
];

describe('Regex Utils - Filter Contacts :', () => {
  it('Should filter contacts with word beginning with user', () => {
    const filterParam = 'user';
    const filtered = contacts.filter(contact =>
      contactsRegex(filterParam).test(contact)
    );
    expect(filtered).toMatchSnapshot();
  });
});
