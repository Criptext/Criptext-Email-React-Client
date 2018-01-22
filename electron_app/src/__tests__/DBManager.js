/* eslint-env node, jest */

const DBManager = require('../DBManager');
const fs = require('fs');

describe('Test DBManager', () => {

  it('should add email to db', async () => {
    await DBManager.insertRow('email', {
      key: 'hdnfgdgsd',
      threadId: 'hdnfgdgsd',
      s3Key: 'hdnfgdgsd',
      unread: false,
      secure: true,
      content: 'Hello there',
      preview: 'Hello there',
      subject: 'Greetings',
      delivered: 0,
      date: '2013-10-07 08:23:19.120',
      isTrash: false,
      isDraft: false,
    })
    
    const email = await DBManager.getRow('email', {
      threadId: 'hdnfgdgsd'
    })
    expect(email).toMatchSnapshot();
  });

  afterAll(() => {
    DBManager.closeDB();
    fs.unlink('./src/__tests__/test.db');
  });

});