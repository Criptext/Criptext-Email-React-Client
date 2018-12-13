import file from './../../../public/emails.json';
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

export const getEmailByKey = key => {
  return emails.filter(email => email.key === key);
};

export const getFilesByEmailId = emailId => {
  return files.filter(file => file.emailId === emailId);
};

export const getFileKeyByEmailId = emailId => {
  return fileKeys.filter(fileKey => fileKey.emailId === emailId);
};
