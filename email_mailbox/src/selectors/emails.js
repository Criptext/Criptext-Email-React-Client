import { createSelector } from 'reselect';
import { compareEmailDate } from '../utils/EmailUtils';

const getEmails = state => state.get('emails');

const getEmailIds = (state, props) => props.emailIds;

const defineEmails = (emails, emailIds) => {
  const emailsFiltered = emails.size
    ? emailIds
        .filter(emailId => emails.get(`${emailId}`))
        .map(emailId => {
          return emails.get(`${emailId}`).toJS();
        })
        .sort(compareEmailDate)
    : [];
  const emailKeysUnread = emailsFiltered
    .filter(email => email.unread)
    .map(email => email.key);
  return { emails: emailsFiltered, emailKeysUnread };
};

export const makeGetEmails = () => {
  return createSelector([getEmails, getEmailIds], (emails, emailIds) =>
    defineEmails(emails, emailIds)
  );
};
