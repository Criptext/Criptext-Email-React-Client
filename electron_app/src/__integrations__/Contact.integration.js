/* eslint-env node, jest */

const DBManager = require('../DBManager');

const contact = {
  email: 'user@domain.com',
  name: 'User'
};

const insertContact = async () => {
  await DBManager.createContact(contact);
};

beforeAll(async () => {
  await DBManager.cleanDataBase();
  await DBManager.createTables();
  await insertContact();
});

describe('Store data contact to Contact Table:', () => {
  it('should insert contact to database', async () => {
    const contact = {
      email: 'userhello@domain.com',
      name: 'User Hello'
    };
    await DBManager.createContact(contact);
    const emails = [contact.email];
    const [result] = await DBManager.getContactByEmails(emails);
    expect(result).toMatchObject(
      expect.objectContaining({
        email: contact.email
      })
    );
  });
});

describe('Load data contact from Contact Table:', () => {
  it('should load all contacts', async () => {
    const contacts = await DBManager.getAllContacts();
    expect(contacts).toMatchSnapshot();
  });
});
