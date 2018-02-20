/* eslint-env node, jest */

const DBManager = require('../DBManager');

beforeAll(async () => {
  await DBManager.cleanDataBase();
  await DBManager.createTables();
});

describe('TABLE[Label]:', () => {
  it('should create label to db', async () => {
    await DBManager.createLabel({
      color: '#ffffff',
      text: 'Inbox'
    });
    const labels = await DBManager.getAllLabels();
    expect(labels).toMatchSnapshot();
  });

  it('should update label: color and text', async () => {
    await DBManager.createLabel({
      color: '#ffffff',
      text: 'Sent'
    });
    await DBManager.updateLabel({
      id: 2,
      color: '#000000',
      text: 'labelmodified'
    });
    const label = await DBManager.getLabelById(2);
    expect(label).toMatchSnapshot();
  });

  it('should update label: color', async () => {
    await DBManager.createLabel({
      color: '#ffffff',
      text: 'Spam'
    });
    await DBManager.updateLabel({ id: 3, color: '#111111' });
    const label = await DBManager.getLabelById(3);
    expect(label).toMatchSnapshot();
  });

  it('should update label: text', async () => {
    await DBManager.createLabel({
      color: '#ffffff',
      text: 'Trash'
    });
    await DBManager.updateLabel({ id: 4, text: 'labelmodified2' });
    const label = await DBManager.getLabelById(4);
    expect(label).toMatchSnapshot();
  });
});
