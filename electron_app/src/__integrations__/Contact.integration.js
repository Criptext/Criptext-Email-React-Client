/* eslint-env node, jest */
const DBManager = require('../database');

const contact = {
  email: 'user@domain.com',
  name: 'User'
};

const insertContact = async () => {
  await DBManager.createContact([contact]);
};

beforeAll(async () => {
  await DBManager.deleteDatabase();
  await DBManager.initDatabaseEncrypted({
    key: '1111',
    shouldAddSystemLabels: true
  });
  await insertContact();
});

describe('Store data contact to Contact Table:', () => {
  it('should insert contact to database', async () => {
    const contact = {
      email: 'userhello@domain.com',
      name: 'User Hello'
    };
    const contactCreated = await DBManager.createContact([contact]);
    expect(contactCreated.length).toBe(1);
    expect(typeof contactCreated[0]).toBe('object');
    const emails = [contact.email];
    const [result] = await DBManager.getContactByEmails(emails);
    expect(result).toMatchObject(
      expect.objectContaining({
        email: contact.email
      })
    );
  });

  it('should insert contact not repeated to database', async () => {
    const contacts = [
      'user@domain.com',
      'userhello@domain.com',
      'a@domain.com'
    ];
    const result = await DBManager.createContactsIfOrNotStore(contacts);
    expect(result.length).toBe(3);
  });
});

describe('Update data contact from Contact Table:', () => {
  it('should update contact', async () => {
    const contact = { name: 'A', email: 'a@domain.com' };
    const [result] = await DBManager.updateContactByEmail(contact);
    expect(result).toBe(1);
    const ids = [3];
    const [resultContact] = await DBManager.getContactByIds(ids);
    expect(resultContact).toMatchObject(expect.objectContaining(contact));
  });
});

describe('Load data contact from Contact Table:', () => {
  it('should load all contacts', async () => {
    const contacts = await DBManager.getAllContacts();
    expect(contacts).toMatchSnapshot();
  });

  it('should load contacts by ids', async () => {
    const ids = [1, 3];
    const contacts = await DBManager.getContactByIds(ids);
    expect(contacts[0].id).toBe(1);
    expect(contacts[1].id).toBe(3);
  });
});
