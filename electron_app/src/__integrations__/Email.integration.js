/* eslint-env node, jest */

const DBManager = require('../DBManager');

beforeAll(async () => {
  await DBManager.cleanDataBase();
  await DBManager.createTables();
});

describe('TABLE[Email]:', () => {
  it('should create email to db', async () => {
    await DBManager.createEmail({
      email: {
        threadId: 'threadJ',
        key: 'hdnfgdgsd',
        s3Key: 'hdnfgdgsd',
        subject: 'Greetings',
        content: '<p>Hello there</p>',
        preview: 'Hello there',
        date: '2013-10-07 08:23:19.120',
        delivered: 0,
        unread: true,
        secure: true,
        isTrash: false,
        isDraft: true,
        isMuted: false
      }
    });
    const emails = await DBManager.getEmailsByThreadId('threadJ');
    expect(emails).toMatchSnapshot();
  });

  it('should update email: isDraft', async () => {
    await DBManager.updateEmail({
      id: 1,
      isDraft: false
    });
    const emails = await DBManager.getEmailsByThreadId('threadJ');
    expect(emails).toMatchSnapshot();
  });

  it('should update email: isMuted', async () => {
    await DBManager.updateEmail({
      id: 1,
      isMuted: true
    });
    const emails = await DBManager.getEmailsByThreadId('threadJ');
    expect(emails).toMatchSnapshot();
  });
});
