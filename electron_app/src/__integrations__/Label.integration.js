/* eslint-env node, jest */
const DBManager = require('../database');
const systemLabels = require('../systemLabels');

let accountId;

const account = {
  recipientId: 'user',
  deviceId: 1,
  name: 'User One',
  registrationId: 2,
  privKey: 'aaa',
  pubKey: 'bbb'
};

const insertAccount = async () => {
  return await DBManager.createAccount(account);
};

beforeAll(async () => {
  await DBManager.deleteDatabase();
  await DBManager.initDatabaseEncrypted({
    key: '1111'
  });
  const [account] = await insertAccount();
  accountId = account.id;
});

let labelToDelete;
let labelToUpdate;

describe('Store data label to Label Table:', () => {
  it('Should create labels to db', async () => {
    const labels = Object.values(systemLabels);
    const result = await DBManager.createLabel(labels);
    expect(result).toMatchSnapshot();
  });

  it('Should create label to db', async () => {
    const label = {
      color: '1311a1',
      text: 'Task',
      accountId
    };
    const result = await DBManager.createLabel(label);
    labelToDelete = result;
    const uuidRegex = /([0-9a-z]){8}-([0-9a-z]){4}-([0-9a-z]){4}-([0-9a-z]){4}-([0-9a-z]){12}/;
    expect(result).toMatchObject({
      accountId,
      color: label.color,
      text: label.text,
      type: 'custom',
      visible: true
    });
    expect(result.uuid).toMatch(uuidRegex);
  });
});

describe('Delete label from Label Table:', () => {
  it('Should delete label by labelId', async () => {
    const result = await DBManager.deleteLabelById(labelToDelete.id);
    expect(result).toBe(1);
  });

  it('Should not delete label by labelId', async () => {
    const result = await DBManager.deleteLabelById(1000);
    expect(result).toBe(0);
  });
});

describe('Load data labels from Label Table:', () => {
  it('Should load all labels', async () => {
    const result = await DBManager.getAllLabels({ accountId });
    expect(result.length).toBe(6);
    expect(result[0]).toMatchSnapshot();
  });

  it('Should load label by labelId', async () => {
    const result = await DBManager.getLabelById(1);
    expect(result.length).toBe(1);
    expect(result[0]).toMatchSnapshot();
  });

  it('Should load labels by: text', async () => {
    const label1 = {
      color: '777777',
      text: 'label',
      uuid: '00000000-0000-0000-0000-000000000008',
      accountId
    };
    const label2 = {
      color: '888888',
      text: 'LABEL',
      uuid: '00000000-0000-0000-0000-000000000009',
      accountId
    };
    const label3 = {
      color: '999999',
      text: 'AnotherLabel',
      uuid: '00000000-0000-0000-0000-000000000010',
      accountId
    };
    const label4 = {
      color: '101010',
      text: 'Test',
      uuid: '00000000-0000-0000-0000-000000000011',
      accountId
    };
    const labelsToInsert = [label1, label2, label3, label4];
    await DBManager.createLabel(labelsToInsert);

    const textToSearch = ['label', 'Test'];
    const expectedLabels = [label1, label2, label4];
    const labels = await DBManager.getLabelsByText({
      text: textToSearch,
      accountId
    });

    // Custom label matcher
    expect.extend({
      labelArraysAreEqual(received, argument) {
        const a = received.map((item, index) => {
          const i = index === 2 ? 3 : index;
          const aLabel = labelsToInsert[i];
          return (
            item.accountId === aLabel.accountId &&
            item.text === aLabel.text &&
            item.uuid === aLabel.uuid &&
            item.type === 'custom'
          );
        });
        const pass = !a.includes(false);
        if (pass) {
          return {
            message: () =>
              `Expected ${this.utils.printReceived(
                received
              )} is not equal to ${this.utils.printExpected(argument)}`,
            pass: true
          };
        }
        return {
          message: () =>
            `Expected ${this.utils.printReceived(
              received
            )} is equal to ${this.utils.printExpected(argument)}`,
          pass: false
        };
      }
    });
    expect(labels).labelArraysAreEqual(expectedLabels);
  });

  it('Should load label by uuid', async () => {
    const result = await DBManager.getLabelByUuid({
      uuid: '00000000-0000-0000-0000-000000000008',
      accountId
    });
    expect(result.length).toBe(1);
    expect(result[0]).toMatchSnapshot();
  });
});

describe('Update data label to Label Table:', () => {
  it('Should update label: color and text', async () => {
    const label = {
      color: '333333',
      text: 'news',
      accountId
    };
    labelToUpdate = await DBManager.createLabel(label);
    const labelIdCreated = labelToUpdate.id;

    const newColor = '333334';
    const newText = 'old-news';
    const result = await DBManager.updateLabel({
      id: labelIdCreated,
      color: newColor,
      text: newText
    });
    expect(result).toEqual(expect.arrayContaining([1]));
    const [labelCheck] = await DBManager.getLabelById(labelIdCreated);
    expect(labelCheck).toMatchObject({
      text: newText,
      color: newColor
    });
  });

  it('Should update label: color', async () => {
    const labelIdCreated = labelToUpdate.id;
    const newColor = '444555';
    const labelUpdated = await DBManager.updateLabel({
      id: labelIdCreated,
      color: newColor
    });
    expect(labelUpdated).toEqual(expect.arrayContaining([1]));
    const [labelCheck] = await DBManager.getLabelById(labelIdCreated);
    expect(labelCheck.color).toBe(newColor);
  });

  it('Should update label: text', async () => {
    const labelIdCreated = labelToUpdate.id;
    const newText = 'LabelModified2';
    await DBManager.updateLabel({ id: labelIdCreated, text: newText });
    const [labelCheck] = await DBManager.getLabelById(labelIdCreated);
    expect(labelCheck.text).toBe(newText);
  });

  it('Should update label: visible', async () => {
    const labelIdCreated = labelToUpdate.id;
    const newVisibleValue = false;
    await DBManager.updateLabel({
      id: labelIdCreated,
      visible: newVisibleValue
    });
    const [labelCheck] = await DBManager.getLabelById(labelIdCreated);
    expect(labelCheck.visible).toBeFalsy();
  });
});
