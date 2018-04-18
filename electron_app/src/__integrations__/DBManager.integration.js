/* eslint-env node, jest */

const DBManager = require('../DBManager');

beforeAll(async () => {
  await DBManager.cleanDataBase();
  await DBManager.createTables();
});

describe('Test DBManager', () => {
  it('should add email to db', async () => {
    await DBManager.createEmail({
      email: {
        key: 'hdnfgdgsd',
        threadId: 'hdnfgdgsd',
        s3Key: 'hdnfgdgsd',
        unread: true,
        secure: true,
        content: 'Hello there',
        preview: 'Hello there',
        subject: 'Greetings',
        delivered: 0,
        date: '2013-10-07 08:23:19.120',
        isMuted: false
      }
    });

    const emails = await DBManager.getEmailsByThreadId('hdnfgdgsd');
    expect(emails).toMatchSnapshot();
  });

  it('should update thread emails as read', async () => {
    const threadId = 'hdnfgdgsd';
    const unread = false;
    await DBManager.updateEmailByThreadId({ threadId, unread });
    const emails = await DBManager.getEmailsByThreadId('hdnfgdgsd');
    expect(emails).toMatchSnapshot();
  });

  it('should delete email', async () => {
    await DBManager.deleteEmail({ key: 'hdnfgdgsd' });
    const emails = await DBManager.getEmailsByThreadId('hdnfgdgsd');
    expect(emails).toMatchSnapshot();
  });
});
