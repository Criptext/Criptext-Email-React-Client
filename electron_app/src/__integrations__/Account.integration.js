/* eslint-env node, jest */

const DBManager = require('../database');

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

  it('should load account by deviceId', async () => {
    const [account] = await DBManager.getAccountByParams({ deviceId: '' });
    expect(account).toBeUndefined;
  });
});
