/* eslint-env node, jest */

const DBManager = require('../DBManager');

beforeAll(async () => {
  await DBManager.cleanDataBase();
  await DBManager.createTables();
});

describe('TABLE[Label]:', () => {
  it('should create label to db', async () => {
    const labelsToInsert = [
      {
        color: '111111',
        text: 'Inbox',
        uuid: '00000000-0000-0000-0000-000000000001'
      },
      {
        color: '222222',
        text: 'Sent',
        uuid: '00000000-0000-0000-0000-000000000002'
      }
    ];
    await DBManager.createLabel(labelsToInsert);
    const labels = await DBManager.getAllLabels();
    expect(labels).toMatchSnapshot();
  });

  it('should update label: color and text', async () => {
    const labelParams = {
      color: '333333',
      text: 'Draft',
      uuid: '00000000-0000-0000-0000-000000000003'
    };
    const [labelId] = await DBManager.createLabel(labelParams);
    const newColor = '333334';
    const newText = 'DraftModified';
    await DBManager.updateLabel({
      id: labelId,
      color: newColor,
      text: newText
    });
    const [label] = await DBManager.getLabelById(labelId);
    expect(label).toMatchObject({
      text: newText,
      color: newColor
    });
  });

  it('should update label: color', async () => {
    const [id] = await DBManager.createLabel({
      color: '444444',
      text: 'Starred',
      uuid: '00000000-0000-0000-0000-000000000004'
    });
    const newColor = '444555';
    await DBManager.updateLabel({ id, color: newColor });
    const [label] = await DBManager.getLabelById(id);
    expect(label.color).toBe(newColor);
  });

  it('should update label: text', async () => {
    const [id] = await DBManager.createLabel({
      color: '555555',
      text: 'Trash',
      uuid: '00000000-0000-0000-0000-000000000005'
    });
    const newText = 'LabelModified2';
    await DBManager.updateLabel({ id, text: newText });
    const [label] = await DBManager.getLabelById(id);
    expect(label.text).toBe(newText);
  });

  it('should update label: visible', async () => {
    const [id] = await DBManager.createLabel({
      color: '666666',
      text: 'Important',
      uuid: '00000000-0000-0000-0000-000000000006'
    });
    const newVisibleValue = false;
    await DBManager.updateLabel({ id, visible: newVisibleValue });
    const [label] = await DBManager.getLabelById(id);
    expect(label.visible).toBeFalsy();
  });

  it('get labels by: text', async () => {
    const label1 = {
      color: '777777',
      text: 'label',
      uuid: '00000000-0000-0000-0000-000000000007'
    };
    const label2 = {
      color: '888888',
      text: 'LABEL',
      uuid: '00000000-0000-0000-0000-000000000008'
    };
    const label3 = {
      color: '999999',
      text: 'AnotherLabel',
      uuid: '00000000-0000-0000-0000-000000000009'
    };
    const label4 = {
      color: '101010',
      text: 'Test',
      uuid: '00000000-0000-0000-0000-000000000010'
    };
    const labelsToInsert = [label1, label2, label3, label4];
    await DBManager.createLabel(labelsToInsert);

    const textToSearch = ['label', 'Test'];
    const expectedLabels = [label1, label2, label4];
    const labels = await DBManager.getLabelsByText(textToSearch);

    // Custom label matcher
    expect.extend({
      labelArraysAreEqual(received, argument) {
        const formattedReceived = received
          .map(labelReceived => ({
            text: labelReceived.text,
            color: labelReceived.color,
            uuid: labelReceived.uuid
          }))
          .sort();
        const sortedArgument = argument.sort();
        const pass = this.equals(formattedReceived, sortedArgument);
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
});
