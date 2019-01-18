import { appDomain } from './const';
import file from './../../../public/emails.json';

const contacts = [
  {
    id: 1,
    name: 'Usuario 1',
    email: `usuario1@${appDomain}`
  },
  {
    id: 2,
    name: 'Usuario 2',
    email: `usuario2@${appDomain}`
  },
  {
    id: 3,
    name: 'Usuario 3',
    email: `usuario3@${appDomain}`
  },
  {
    id: 4,
    name: 'Usuario 4',
    email: `usuario4@${appDomain}`
  }
];

const emails = file.emails;

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
    emailId: emails[1].id,
    key: 'jocmpqwrwgonedbsfsq==',
    iv: 'cmwgnoveirgkddfg=='
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

export const getEmailByKey = key => {
  return emails.filter(email => email.key === key);
};

export const getFilesByEmailId = emailId => {
  return files.filter(file => file.emailId === emailId);
};

export const getFileKeyByEmailId = emailId => {
  return fileKeys.filter(fileKey => fileKey.emailId === emailId);
};
