/* eslint-env node, jest */
const DBManager = require('../database');

let accountId;
let accountId2;

const account = {
  recipientId: 'user',
  deviceId: 1,
  name: 'User One',
  registrationId: 2,
  privKey: 'aaa',
  pubKey: 'bbb'
};

const account2 = {
  recipientId: 'user2',
  deviceId: 1,
  name: 'User One',
  registrationId: 2,
  privKey: 'ccc',
  pubKey: 'ddd'
};

const contact = {
  email: 'user@domain.com',
  name: 'User'
};

const insertAccount = async () => {
  const [accountCreated] = await DBManager.createAccount(account);
  accountId2 = accountCreated.id;
  return await DBManager.createAccount(account2);
};

const insertContact = async accountId => {
  await DBManager.createContact({ contacts: [contact], accountId });
};

beforeAll(async () => {
  await DBManager.deleteDatabase();
  await DBManager.initDatabaseEncrypted({
    key: '1111',
    shouldAddSystemLabels: true
  });
  const [account] = await insertAccount();
  accountId = account.id;
  await insertContact(accountId);
});

describe('Store data contact to Contact Table:', () => {
  it('should insert contact to database', async () => {
    const contact = {
      email: 'userhello@domain.com',
      name: 'User Hello'
    };
    const contactCreated = await DBManager.createContact({
      contacts: [contact],
      accountId
    });
    expect(contactCreated.length).toBe(1);
    expect(typeof contactCreated[0]).toBe('object');
    const emails = [contact.email];
    const [result] = await DBManager.getContactByEmails({ emails, accountId });
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
    const result = await DBManager.createContactsIfOrNotStore({
      contacts,
      accountId
    });
    expect(result.length).toBe(3);
  });

  it('should insert relation contact_account to database', async () => {
    const contacts = ['a@domain.com'];
    const result = await DBManager.createContactsIfOrNotStore({
      contacts,
      accountId: accountId2
    });
    expect(result.length).toBe(1);
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
