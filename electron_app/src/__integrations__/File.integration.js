/* eslint-env node, jest */

const DBManager = require('../DBManager');

const file = {
  token: 'token1',
  name: 'Criptext_Image_2018_06_14.png',
  readOnly: false,
  size: 183241,
  status: 1,
  date: '2018-06-14T23:45:57.466Z',
  emailId: 2,
  mimeType: 'image/png'
};

const insertFile = async () => {
  await DBManager.createFile(file);
};

beforeAll(async () => {
  await DBManager.cleanDataBase();
  await DBManager.createTables();
  await insertFile();
});

describe('Store data file to File Table:', () => {
  it('should insert file to database', async () => {
    await DBManager.createFile({
      token: 'token2',
      name: 'Criptext_Image_2018_06_14.png',
      readOnly: false,
      size: 183241,
      status: 1,
      date: '2018-06-14T23:45:57.466Z',
      emailId: 1,
      mimeType: 'image/png'
    });
    const tokens = ['token2'];
    const files = await DBManager.getFilesByTokens(tokens);
    expect(files).toMatchSnapshot();
  });
});

describe('Load data file from File Table:', () => {
  it('should load file by tokens', async () => {
    const token = 'token1';
    const [file] = await DBManager.getFilesByTokens([token]);
    expect(file.token).toBe(token);
  });
});
