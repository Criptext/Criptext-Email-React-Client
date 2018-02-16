/* eslint-env node, jest */

const DBManager = require('../DBManager');
const fs = require('fs');

beforeAll(async () => {
  await DBManager.createTables();
});

describe('Test TABLE[Label]::', () => {
  it('should create label to db', async () => {
    await DBManager.createLabel({
      color: '#ffffff',
      text: 'Inbox'
    });

    const labels = await DBManager.getAllLabels();
    expect(labels).toMatchSnapshot();
  });

  it('should update label: color and text', async () => {
    await DBManager.updateLabel({
      id: 1,
      color: '#000000',
      text: 'labelmodified'
    });
    const labels = await DBManager.getAllLabels();
    expect(labels).toMatchSnapshot();
  });

  it('should update label: color', async () => {
    await DBManager.updateLabel({ id: 1, color: '#111111' });
    const labels = await DBManager.getAllLabels();
    expect(labels).toMatchSnapshot();
  });

  it('should update label: text', async () => {
    await DBManager.updateLabel({ id: 1, text: 'labelmodified2' });
    const labels = await DBManager.getAllLabels();
    expect(labels).toMatchSnapshot();
  });

  afterAll(() => {
    fs.unlinkSync('./src/__tests__/test.db');
  });
});
