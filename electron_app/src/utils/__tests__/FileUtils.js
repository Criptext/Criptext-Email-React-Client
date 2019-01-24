/* eslint-env node, jest */
const fileUtils = require('./../FileUtils.js');

const username = 'test@criptext.com';
const textSample = 'Hello World!';
const key = 1;

afterAll(() => {
  fileUtils.removeUserDir(username);
});

describe('File Utils test ', () => {
  it(' Store text and retrieve it from filesystem ', async done => {
    await fileUtils.saveEmailBody({
      body: textSample,
      username,
      metadataKey: key
    });
    const savedText = await fileUtils.getEmailBody({
      username,
      metadataKey: key
    });
    expect(savedText).toEqual(textSample);
    done();
  });
});
