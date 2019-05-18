/* eslint-env node, jest */

const DBManager = require('../DBManager');
const { accounts } = require('./data/accounts.json');

const accountA = accounts[0];
const accountB = accounts[1];
const accountC = accounts[2];

const createAccount = async account => {
  return await DBManager.createAccount(account);
};

beforeEach(async () => {
  await DBManager.cleanDataBase();
  await DBManager.createTables();
});

describe('Store account data to Account Table: ', () => {
  it('Should insert account to database', async () => {
    const [accountId] = await createAccount(accountA);
    const [result] = await DBManager.getAccountByParams({ id: accountId });
    const parsedResult = Object.assign(result, {
      isActive: !!result.isActive,
      isLoggedIn: !!result.isLoggedIn
    });
    expect(parsedResult).toMatchObject(
      expect.objectContaining({
        recipientId: accountA.recipientId,
        name: accountA.name,
        isActive: accountA.isActive,
        isLoggedIn: accountA.isLoggedIn
      })
    );
  });

  it('Should insert new account and update older', async () => {
    const [oldId] = await createAccount(accountA);
    const [newId] = await createAccount(accountB);
    const [prevAccount] = await DBManager.getAccountByParams({ id: oldId });
    const parsedPrevAccount = Object.assign(prevAccount, {
      isActive: !!prevAccount.isActive,
      isLoggedIn: !!prevAccount.isLoggedIn
    });
    const [newAccount] = await DBManager.getAccountByParams({ id: newId });
    const parsedNewAccount = Object.assign(newAccount, {
      isActive: !!newAccount.isActive,
      isLoggedIn: !!newAccount.isLoggedIn
    });
    expect(parsedPrevAccount).toMatchObject(
      expect.objectContaining({
        recipientId: accountA.recipientId,
        name: accountA.name,
        isActive: false,
        isLoggedIn: true
      })
    );
    expect(parsedNewAccount).toMatchObject(
      expect.objectContaining({
        recipientId: accountB.recipientId,
        name: accountB.name,
        isActive: true,
        isLoggedIn: true
      })
    );
  });
});

describe('Load account data from Account Table: ', () => {
  it('Should not load accounts', async () => {
    const [activeAccount] = await DBManager.getAccount();
    expect(activeAccount).toBeUndefined();
  });

  it('Should load all logged accounts', async () => {
    await createAccount(accountA);
    await createAccount(accountB);
    const loggedAccounts = await DBManager.getAccountByParams({
      isLoggedIn: true
    });
    const parsedAccounts = loggedAccounts.map(account =>
      Object.assign(account, {
        isActive: !!account.isActive,
        isLoggedIn: !!account.isLoggedIn
      })
    );
    expect(parsedAccounts[0]).toMatchObject({
      recipientId: accountA.recipientId,
      name: accountA.name,
      isActive: false,
      isLoggedIn: true
    });
    expect(parsedAccounts[1]).toMatchObject({
      recipientId: accountB.recipientId,
      name: accountB.name,
      isActive: true,
      isLoggedIn: true
    });
  });
});

describe('Delete account data from Account Table: ', () => {
  it('Should delete an account from database', async () => {
    const [accountId] = await createAccount(accountC);
    await DBManager.deleteAccountByParams({ id: accountId });
    const [result] = await DBManager.getAccountByParams({ id: accountId });
    expect(result).toBeUndefined();
  });
});
