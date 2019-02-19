/* eslint-env node, jest */
const DBManager = require('../DBManager');
const systemLabels = require('./../systemLabels');

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
    isMuted: false,
    unsendDate: '2018-06-14 08:23:20.000',
    messageId: 'messageIdA',
    fromAddress: '<User me> <user@criptext.com>'
  },
  recipients: {
    from: ['<User me> <user@criptext.com>']
  },
  labels: [5, 6]
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
    isMuted: false,
    unsendDate: '2018-06-14 08:23:20.000',
    messageId: 'messageIdB',
    fromAddress: 'User me <user@criptext.com>'
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
    isMuted: false,
    unsendDate: '2018-06-14 08:23:20.000',
    messageId: 'messageIdC',
    fromAddress: 'User A <usera@criptext.com>'
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

const emailReply = {
  email: {
    threadId: 'threadC',
    key: 'keyD',
    s3Key: 's3KeyD',
    subject: 'Greetings',
    content: '<p>RE: Hello there</p>',
    preview: 'RE: Hello there',
    date: '2018-06-15 08:23:19.120',
    status: 0,
    unread: true,
    secure: true,
    isMuted: false,
    unsendDate: '2018-06-14 08:23:20.000',
    messageId: 'messageIdD',
    fromAddress: 'user@criptext.com'
  },
  recipients: {
    from: ['user@criptext.com'],
    to: ['usera@criptext.com']
  },
  labels: [3]
};

const emailSpam = {
  email: {
    threadId: 'threadE',
    key: 'keyE',
    s3Key: 's3KeyE',
    subject: 'Greetings',
    content: '<p>Hello there</p>',
    preview: 'Hello there',
    date: '2018-09-11 14:38:19.120',
    status: 5,
    unread: true,
    secure: true,
    isMuted: false,
    unsendDate: '2018-06-14 08:23:20.000',
    trashDate: null,
    messageId: 'messageIdE',
    fromAddress: 'user@criptext.com'
  },
  recipients: {
    from: ['user@criptext.com'],
    to: ['usera@criptext.com']
  },
  labels: [2]
};

const emailStarred = {
  email: {
    threadId: 'threadF',
    key: 'keyF',
    s3Key: 's3KeyF',
    subject: 'Greetings there',
    content: '<p>Hello there</p>',
    preview: 'Hello there',
    date: '2013-09-11 08:23:19.120',
    status: 5,
    unread: false,
    secure: false,
    isMuted: false,
    unsendDate: '2018-06-14 08:23:20.000',
    trashDate: null,
    messageId: 'messageIdF',
    fromAddress: 'User me <user@criptext.com>'
  },
  recipients: {
    from: ['User me <user@criptext.com>'],
    to: ['usera@criptext.com', 'userb@criptext.com']
  },
  labels: [4]
};

const emailScore = {
  email: {
    threadId: 'threadG',
    key: 'keyG',
    s3Key: 's3KeyG',
    subject: 'Greetings there',
    content: '<p>Hello there</p>',
    preview: 'Hello there',
    date: '2014-09-11 09:23:19.120',
    status: 5,
    unread: false,
    secure: false,
    isMuted: false,
    unsendDate: '2018-06-14 08:23:20.000',
    trashDate: null,
    messageId: 'messageIdG',
    fromAddress: 'User me <user@criptext.com>'
  },
  recipients: {
    from: ['User me <user@criptext.com>'],
    to: ['userscore@criptext.com']
  },
  labels: [3]
};

const emailUpdate = {
  email: {
    threadId: 'threadH',
    key: 'keyH',
    s3Key: 's3KeyH',
    subject: 'Greetings',
    content: '<p>Hello there</p>',
    preview: 'Hello there',
    date: '2013-10-07 08:23:20.120',
    status: 1,
    unread: true,
    secure: true,
    isMuted: false,
    unsendDate: '2018-06-14 08:23:20.000',
    messageId: 'messageIdH',
    fromAddress: 'User me <user@criptext.com>'
  },
  recipients: {
    from: ['User me <user@criptext.com>'],
    to: ['usera@criptext.com', 'userb@criptext.com']
  },
  labels: [3]
};

const insertEmails = async () => {
  await DBManager.createEmail(emailDraft);
  await DBManager.createEmail(emailSent);
  await DBManager.createEmail(emailInbox);
  await DBManager.createEmail(emailReply);
  await DBManager.createEmail(emailSpam);
  await DBManager.createEmail(emailStarred);
  await DBManager.createEmail(emailUpdate);
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
        isMuted: false,
        unsendDate: '2018-06-14 08:23:20.000',
        messageId: 'messageId',
        fromAddress: 'From Contact <from@criptext.com>'
      }
    });
    const key = 'keyId';
    const email = await DBManager.getEmailByKey(key);
    expect(email).toMatchSnapshot();
  });
});

describe('Store relation data to EmailLabel Table: ', () => {
  it('Should insert emailLabel relation to database', async () => {
    const [email] = await DBManager.getEmailByKey(emailUpdate.email.key);
    const emailLabelToInsert = [
      { emailId: email.id, labelId: systemLabels.starred.id },
      { emailId: email.id, labelId: systemLabels.trash.id }
    ];
    const response = await DBManager.createEmailLabel(emailLabelToInsert);
    expect(response[0]).toEqual(expect.any(Number));
  });

  it('Should not insert emailLabel relation to database', async () => {
    const [email] = await DBManager.getEmailByKey(emailDraft.email.key);
    const emailLabelDraft = [
      { emailId: email.id, labelId: systemLabels.draft.id }
    ];
    const response = await DBManager.createEmailLabel(emailLabelDraft);
    expect(response).toBeUndefined();
  });
});

describe('Load data emails from Email Table:', () => {
  it('should retrieve emails from DB with label id: Sent', async () => {
    const labelIds = [3];
    const [email] = await DBManager.getEmailsByLabelIds(labelIds);
    expect(email.key).toBe(emailSent.email.key);
  });
});

describe('Update data email to Email Table:', () => {
  it('should update email: isMuted', async () => {
    const id = 2;
    await DBManager.updateEmail({
      id,
      isMuted: true
    });
    const [email] = await DBManager.getEmailsByIds([id]);
    const isMuted = email.isMuted;
    expect(isMuted).toBe(1);
  });

  it('should update email: unread by id', async () => {
    const id = 3;
    await DBManager.updateEmail({
      id,
      unread: false
    });
    const [email] = await DBManager.getEmailsByIds([id]);
    const unread = email.unread;
    expect(unread).toBe(0);
  });

  it('should update emails: unread by keys', async () => {
    const keys = ['keyC', 'keyId'];
    await DBManager.updateEmails({
      keys,
      unread: false
    });
    const emails = await DBManager.getEmailsByKeys(keys);
    const unreadEmailA = emails[0].unread;
    const unreadEmailB = emails[1].unread;
    expect(unreadEmailA).toBe(0);
    expect(unreadEmailB).toBe(0);
  });

  it('should update email: status by key', async () => {
    const key = 'keyB';
    await DBManager.updateEmail({
      key,
      status: 6
    });
    const [email] = await DBManager.getEmailByKey(key);
    const status = email.status;
    expect(status).toBe(6);
  });

  it('should update emails: trashDate after insert emailLabel trash', async () => {
    const [email] = await DBManager.getEmailByKey(emailStarred.email.key);
    const emailLabelTrash = [
      { emailId: email.id, labelId: systemLabels.trash.id }
    ];
    await DBManager.createEmailLabel(emailLabelTrash);
    const [updatedEmail] = await DBManager.getEmailsByThreadId(
      emailStarred.email.threadId
    );
    const labelIds = updatedEmail.labelIds.split(',').map(Number);
    expect(labelIds).toContain(systemLabels.trash.id);
    expect(new Date(updatedEmail.trashDate)).toEqual(expect.any(Date));
  });

  it('should not update emails: trashDate after insert emailLabel trash', async () => {
    const [email] = await DBManager.getEmailByKey(emailSpam.email.key);
    const emailLabelStarred = [
      { emailId: email.id, labelId: systemLabels.starred.id }
    ];
    await DBManager.createEmailLabel(emailLabelStarred);
    const [updatedEmail] = await DBManager.getEmailsByThreadId(
      emailSpam.email.threadId
    );
    const labelIds = updatedEmail.labelIds.split(',').map(Number);
    expect(labelIds).toContain(systemLabels.starred.id);
    expect(updatedEmail.trashDate).toBeNull();
  });
});

describe('Delete emails from Email Table:', () => {
  it('Should delete email from DB by key', async () => {
    const keysToDelete = [emailSpam.email.key];
    await DBManager.deleteEmailByKeys(keysToDelete);
    const [email] = await DBManager.getEmailByKey(emailSpam.email.key);
    expect(email).toBeUndefined();
  });
});

describe('Load data thread from Email Table:', () => {
  it('should load drafts leaving recipient fields empty', async () => {
    const emails = await DBManager.getEmailsByThreadId('threadA');
    const email = emails[0];
    const { bcc, cc, to } = email;
    expect(to).toBeNull();
    expect(cc).toBeNull();
    expect(bcc).toBeNull();
  });

  it('should load sent email with recipients', async () => {
    const emails = await DBManager.getEmailsByThreadId('threadB');
    const email = emails[0];
    const { bcc, cc, to } = email;
    const numbersSeparatedByCommasRegex = /[0-9]+((,){1}[0-9]+)*/;
    expect(to).toMatch(numbersSeparatedByCommasRegex);
    expect(cc).toMatch(numbersSeparatedByCommasRegex);
    expect(bcc).toMatch(numbersSeparatedByCommasRegex);
  });

  it('should load inboxs with files', async () => {
    const emails = await DBManager.getEmailsByThreadId('threadC');
    const email = emails[0];
    const fileTokens = email.fileTokens;
    expect(fileTokens).toBe('tokenC');
  });

  it('should load threads from DB with the correct shape: inbox', async () => {
    const params = {
      labelId: 1,
      rejectedLabelIds: [2, 6]
    };
    const threads = await DBManager.getEmailsGroupByThreadByParams(params);
    expect(threads).toMatchSnapshot();
  });

  it('should load threads from DB with the correct shape: sent', async () => {
    const params = {
      labelId: 3,
      rejectedLabelIds: [2, 7]
    };
    const threads = await DBManager.getEmailsGroupByThreadByParams(params);
    expect(threads).toMatchSnapshot();
  });

  it('should load threads from DB with the correct shape: inbox. Scroll action', async () => {
    const params = {
      labelId: 1,
      rejectedLabelIds: [2, 7],
      limit: 1
    };
    const [lastThread] = await DBManager.getEmailsGroupByThreadByParams(params);
    const maxDate = lastThread.maxDate;
    const threadIdRejected = lastThread.threadId;
    expect(lastThread).toMatchObject(
      expect.objectContaining({
        threadId: 'threadC',
        emailIds: '3,4'
      })
    );
    const moreParams = {
      labelId: 1,
      rejectedLabelIds: [2, 7],
      limit: 1,
      date: maxDate,
      threadIdRejected
    };
    const moreLastThreads = await DBManager.getEmailsGroupByThreadByParams(
      moreParams
    );
    expect(moreLastThreads).toEqual([]);
  });
});

describe('Update data contact to Contact Table: ', () => {
  it('Should update contact score to 1 after inserting email', async () => {
    await DBManager.createEmail(emailScore);
    const [contact] = await DBManager.getContactByEmails(
      emailScore.recipients.to
    );
    expect(contact.score).toEqual(1);
  });
});
