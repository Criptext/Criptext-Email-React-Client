/* eslint-env node, jest */

const DBManager = require('../DBManager');

const emailDraft = {
  email: {
    threadId: 'threadA',
    key: 'keyA',
    s3Key: 's3KeyA',
    subject: 'Greetings',
    content: '<p>Hello there</p>',
    preview: 'Hello there',
    date: '2013-10-07 08:23:19.120',
    status: 0,
    unread: true,
    secure: true,
    isMuted: false
  },
  recipients: {
    from: ['User me <user@criptext.com>']
  },
  labels: [6]
};

const emailSent = {
  email: {
    threadId: 'threadB',
    key: 'keyB',
    s3Key: 's3KeyB',
    subject: 'Greetings',
    content: '<p>Hello there</p>',
    preview: 'Hello there',
    date: '2013-10-07 08:23:19.120',
    status: 1,
    unread: true,
    secure: true,
    isMuted: false
  },
  recipients: {
    from: ['User me <user@criptext.com>'],
    to: ['usera@criptext.com', 'userb@criptext.com'],
    cc: ['userc@criptext.com'],
    bcc: ['userd@criptext.com']
  },
  labels: [3]
};

const emailInbox = {
  email: {
    threadId: 'threadC',
    key: 'keyC',
    s3Key: 's3KeyC',
    subject: 'Greetings',
    content: '<p>Hello there</p>',
    preview: 'Hello there',
    date: '2018-06-14 08:23:19.120',
    status: 0,
    unread: true,
    secure: true,
    isMuted: false
  },
  recipients: {
    from: ['User A <usera@criptext.com>'],
    to: ['user@criptext.com', 'userb@criptext.com'],
    cc: ['userc@criptext.com'],
    bcc: ['userd@criptext.com']
  },
  labels: [1],
  files: [
    {
      token: 'tokenC',
      name: 'Criptext_Image_2018_06_14.png',
      readOnly: false,
      size: 183241,
      status: 1,
      date: '2018-06-14T23:45:57.466Z',
      mimeType: 'image/png'
    }
  ]
};

const insertEmails = async () => {
  await DBManager.createEmail(emailDraft);
  await DBManager.createEmail(emailSent);
  await DBManager.createEmail(emailInbox);
};

beforeAll(async () => {
  await DBManager.cleanDataBase();
  await DBManager.createTables();
  await insertEmails();
});

describe('Store data email to Email Table:', () => {
  it('should insert email to database', async () => {
    await DBManager.createEmail({
      email: {
        threadId: 'threadId',
        key: 'keyId',
        s3Key: 's3KeyId',
        subject: 'Greetings',
        content: '<p>Hello there</p>',
        preview: 'Hello there',
        date: '2018-06-14 08:23:19.120',
        status: 0,
        unread: true,
        secure: true,
        isMuted: false
      }
    });
    const key = 'keyId';
    const email = await DBManager.getEmailByKey(key);
    expect(email).toMatchSnapshot();
  });
});

describe('Update data email to Email Table:', () => {
  it('should update email: isMuted', async () => {
    const id = 2;
    await DBManager.updateEmail({
      id,
      isMuted: true
    });
    const [email] = await DBManager.getEmailById(id);
    const isMuted = email.isMuted;
    expect(isMuted).toBe(1);
  });

  it('should update email: unread', async () => {
    const id = 3;
    await DBManager.updateEmail({
      id,
      unread: false
    });
    const [email] = await DBManager.getEmailById(id);
    const unread = email.unread;
    expect(unread).toBe(0);
  });
});

describe('Load data thread from Email Table:', () => {
  it('should insert drafts leaving recipient fields empty', async () => {
    const emails = await DBManager.getEmailsByThreadId('threadA');
    const email = emails[0];
    const to = email.to;
    const cc = email.cc;
    const bcc = email.bcc;
    expect(to).toBeNull();
    expect(cc).toBeNull();
    expect(bcc).toBeNull();
  });

  it('should insert sent email with recipients', async () => {
    const emails = await DBManager.getEmailsByThreadId('threadB');
    const email = emails[0];
    const to = email.to;
    const cc = email.cc;
    const bcc = email.bcc;
    const numbersSeparatedByCommasRegex = /[0-9]+((,){1}[0-9]+)*/;
    expect(to).toMatch(numbersSeparatedByCommasRegex);
    expect(cc).toMatch(numbersSeparatedByCommasRegex);
    expect(bcc).toMatch(numbersSeparatedByCommasRegex);
  });

  it('should insert inboxs with files', async () => {
    const emails = await DBManager.getEmailsByThreadId('threadC');
    const email = emails[0];
    const fileTokens = email.fileTokens;
    expect(fileTokens).toBe('tokenC');
  });

  it('should retrieve threads from DB with the correct shape: inbox', async () => {
    const params = {
      labelId: 1
    };
    const threads = await DBManager.getEmailsGroupByThreadByParams(params);
    expect(threads).toMatchSnapshot();
  });

  it('should retrieve threads from DB with the correct shape: sent', async () => {
    const params = {
      labelId: 3
    };
    const threads = await DBManager.getEmailsGroupByThreadByParams(params);
    expect(threads).toMatchSnapshot();
  });
});
