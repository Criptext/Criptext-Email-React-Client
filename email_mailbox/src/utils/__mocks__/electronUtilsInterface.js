/*global process*/
const appDomain =
  process.env.NODE_ENV === 'development' ? 'jigl.com' : 'criptext.com';

const filterCriptextRecipients = recipients => {
  return recipients.filter(email => email.indexOf(`@${appDomain}`) > 0);
};

export const EmailUtils = {
  filterCriptextRecipients
};
