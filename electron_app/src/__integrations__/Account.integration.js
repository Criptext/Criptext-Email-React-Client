/* eslint-env node, jest */

const DBManager = require('../database');
jest.mock('./../Account.js');
jest.mock('../windows/mailbox', () => ({
  getShowPreview: () => {
    return Promise.resolve(true);
  },
  setShowPreview: () => {
    return Promise.resolve();
  }
}));

const account = {
  recipientId: 'user',
  deviceId: 1,
  name: 'User One',
  registrationId: 2,
  privKey: 'ghi',
  pubKey: 'jkl'
};

const insertAccount = async () => {
  await DBManager.createAccount(account);
};

beforeAll(async () => {
  await DBManager.deleteDatabase();
  await DBManager.initDatabaseEncrypted({
    key: '1111',
    shouldAddSystemLabels: true
  });
  await insertAccount();
});

describe('Store data account to Account Table:', () => {
  it('should insert account to database and update old data', async () => {
    const account = {
      recipientId: 'user@domain.com',
      deviceId: 1,
      name: 'User Domain',
      registrationId: 2,
      privKey: 'ghi',
      pubKey: 'jkl',
      shouldUpdate: true
    };
    const accountCreated = await DBManager.createAccount(account);
    expect(accountCreated.length).toBe(1);
    expect(typeof accountCreated[0]).toBe('object');
    expect(accountCreated[0]).toMatchObject(
      expect.objectContaining({
        id: 2,
        isActive: true,
        recipientId: account.recipientId
      })
    );
    const [accountUpdated] = await DBManager.getAccountByParams({
      recipientId: 'user'
    });
    expect(accountUpdated).toMatchObject(
      expect.objectContaining({
        isActive: false
      })
    );
  });
});

describe('Update data account from Account Table:', () => {
  it('should update account', async () => {
    const account = {
      jwt: 'abc',
      refreshToken: 'def',
      recipientId: 'user'
    };
    const [isUpdated] = await DBManager.updateAccount(account);
    expect(isUpdated).toBe(1);
    const accounts = await DBManager.getAccount();
    expect(accounts).toMatchSnapshot();
  });
});

describe('Load account contact from Account Table:', () => {
  it('should load account by recipientId', async () => {
    const [account] = await DBManager.getAccountByParams({
      recipientId: 'user'
    });
    expect(account).toMatchObject(
      expect.objectContaining({
        recipientId: 'user'
      })
    );
  });

  it('should load account by id', async () => {
    const [account] = await DBManager.getAccountByParams({
      id: 2
    });
    expect(account).toMatchObject(
      expect.objectContaining({
        id: 2
      })
    );
  });

  it('should load account by deviceId', async () => {
    const [account] = await DBManager.getAccountByParams({ deviceId: '' });
    expect(account).toBeUndefined;
  });

  it('should load all accounts by order', async () => {
    const accounts = await DBManager.getAllAccounts();
    expect(accounts.length).toBe(2);
    const firstAccount = accounts[0];
    expect(firstAccount).toMatchObject(
      expect.objectContaining({
        id: 2
      })
    );
    const secondAccount = accounts[1];
    expect(secondAccount).toMatchObject(
      expect.objectContaining({
        id: 1
      })
    );
  });
});
