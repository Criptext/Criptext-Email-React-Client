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
        key: '1',
        threadId: '1',
        s3Key: '1',
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
    const threadId = '1';
    const emails = await DBManager.getEmailsByThreadId(threadId);
    expect(emails).toMatchSnapshot();
  });

  it('should update thread emails as read', async () => {
    await DBManager.createEmail({
      email: {
        key: '2',
        threadId: '2',
        s3Key: '2',
        unread: true,
        secure: true,
        content: 'Hello there 2',
        preview: 'Hello there 2',
        subject: 'Greetings 2',
        delivered: 0,
        date: '2013-10-08 08:23:19.120',
        isMuted: false
      }
    });
    const threadId = '2';
    const unread = false;

    await DBManager.updateEmailByThreadId({ threadId, unread });
    const emails = await DBManager.getEmailsByThreadId(threadId);
    const updatedEmail = emails[0];
    expect(updatedEmail.unread).toBe(0);
  });

  it('should delete email', async () => {
    await DBManager.createEmail({
      email: {
        key: '3',
        threadId: '3',
        s3Key: '3',
        unread: true,
        secure: true,
        content: 'Hello there 3',
        preview: 'Hello there 3',
        subject: 'Greetings 3',
        delivered: 0,
        date: '2013-10-09 08:23:19.120',
        isMuted: false
      }
    });
    const threadId = '3';
    const key = '3';
    await DBManager.deleteEmailByKey(key);
    const emails = await DBManager.getEmailsByThreadId(threadId);
    expect(emails).toEqual([]);
  });
});
