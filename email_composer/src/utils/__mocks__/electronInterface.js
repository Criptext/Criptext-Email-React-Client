import { appDomain } from './../const';

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
    delivered: 0,
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
    delivered: 0,
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
    delivered: 0,
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

export const emailId = 1;
export const emailKey = '1';

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
    from: []
  };
  return id === emailId ? response : emptyResponse;
};
