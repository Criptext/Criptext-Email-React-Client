import { appDomain } from './const';

export const myAccount = {
  recipientId: 'julian'
};

const emails = [
  {
    id: 1,
    key: '1',
    threadId: '1',
    s3Key: '1',
    content: 'Email content 1',
    preview: 'Email preview 1',
    subject: 'Email subject 1',
    date: 1514231264772,
    status: 0,
    unread: 1,
    secure: 1,
    isMuted: 0
  },
  {
    id: 2,
    key: '2',
    threadId: '2',
    s3Key: '2',
    content: 'Email content 2',
    preview: 'Email preview 2',
    subject: 'Email subject 2',
    date: 1515624279364,
    status: 0,
    unread: 1,
    secure: 1,
    isMuted: 0
  },
  {
    id: 3,
    key: '3',
    threadId: '3',
    s3Key: '3',
    content: 'Email content 3',
    preview: 'Email preview 3',
    subject: 'Email subject 3',
    date: 1512744868344,
    status: 0,
    unread: 1,
    secure: 1,
    isMuted: 0
  }
];
const contacts = [
  {
    id: 1,
    name: 'Usuario 1',
    email: `toUser@${appDomain}`
  },
  {
    id: 2,
    name: 'Usuario 2',
    email: `ccUser@${appDomain}`
  },
  {
    id: 3,
    name: 'Usuario 3',
    email: `bccUser@${appDomain}`
  },
  {
    id: 4,
    name: 'Usuario 4',
    email: `fromUser@${appDomain}`
  }
];

const files = [
  {
    id: 1,
    token: 'tokenFile1',
    name: 'Criptext_file_1.png',
    readOnly: 0,
    size: 149836,
    status: 1,
    date: '2018-11-23 17:24:36',
    mimeType: 'image/png',
    ephemeral: 0,
    ephemeralStart: 0,
    ephemeralTime: 0,
    emailId: emails[1].id
  }
];

const fileKeys = [
  {
    id: 1,
    key: 'key_file1',
    iv: 'iv_file1',
    emailId: emails[1].id
  }
];

export const emailId = 1;
export const emailKey = '1';
export const emailKeyWithFile = '2';

export const getEmailByKey = key => {
  return emails.filter(email => email.key === key);
};

export const getContactsByEmailId = id => {
  const response = {
    to: [{ email: contacts[0].email }],
    cc: [{ email: contacts[1].email }],
    bcc: [{ email: contacts[2].email }],
    from: [{ email: contacts[3].email }]
  };
  const emptyResponse = {
    to: [],
    cc: [],
    bcc: [],
    from: [{ email: contacts[3].email }]
  };
  return id === emailId ? response : emptyResponse;
};

export const composerEvents = {
  EDIT_DRAFT: 'edit-draft',
  REPLY: 'reply',
  REPLY_ALL: 'reply-all',
  FORWARD: 'forward'
};

export const getFilesByEmailId = emailId => {
  return files.filter(file => file.emailId === emailId);
};

export const getFileKeyByEmailId = emailId => {
  return fileKeys.filter(fileKey => fileKey.emailId === emailId);
};
