import { appDomain } from './const';
import file from './../../../public/emails.json';
const emails = file.emails;

export const myAccount = {
  recipientId: 'julian'
};

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

export const getFileKeyByEmailId = emailId => {
  return fileKeys.filter(fileKey => fileKey.emailId === emailId);
};
