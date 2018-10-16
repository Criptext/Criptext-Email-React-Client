const appDomain = 'criptext.com';

const filterCriptextRecipients = recipients => {
  return recipients.filter(email => email.indexOf(`@${appDomain}`) > 0);
};

export const EmailUtils = {
  filterCriptextRecipients
};
