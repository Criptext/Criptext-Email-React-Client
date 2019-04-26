/* eslint-env node, jest */

const DBManager = require('../DBManager');
const { accounts } = require('./data/accounts.json');
const accountA = accounts[0];

let accountId;
const contact = {
  email: 'user@domain.com',
  name: 'User'
};

const insertAccount = async () => {
  [accountId] = await DBManager.createAccount(accountA);
};

const insertContact = async () => {
  const updatedContact = Object.assign(contact, { accountId });
  await DBManager.createContact(updatedContact);
};

beforeAll(async () => {
  await DBManager.cleanDataBase();
  await DBManager.createTables();
  await insertAccount();
  await insertContact();
});

describe('Store data contact to Contact Table:', () => {
  it('should insert contact to database', async () => {
    const contact = {
      email: 'userhello@domain.com',
      name: 'User Hello',
      accountId
    };
    await DBManager.createContact(contact);
    const emails = [contact.email];
    const [result] = await DBManager.getContactByEmails({
      emails,
      accountId: accountA.id
    });
    expect(result).toMatchObject(
      expect.objectContaining({
        email: contact.email
      })
    );
  });
});

describe('Load data contact from Contact Table:', () => {
  it('should load all contacts', async () => {
    const contacts = await DBManager.getAllContacts(accountA.id);
    expect(contacts).toMatchSnapshot();
  });
});
