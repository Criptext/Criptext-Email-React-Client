import file from './../../../public/emails.json';
const emails = file.emails;

export const getEmailByKey = key => {
  return emails.filter(email => email.key === key);
};
