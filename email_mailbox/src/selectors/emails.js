import { createSelector } from 'reselect';
import { defineContact, getContacts, defineContactFrom } from './contacts';
import { compareEmailDate, parseContactRow } from '../utils/EmailUtils';
import string from './../lang';

const getEmails = state => state.get('emails');

const getEmailIds = (state, props) => props.emailIds;

const defineEmails = (emails, contacts, emailIds) => {
  const emailsFiltered = emails.size
    ? emailIds
        .filter(emailId => emails.get(`${emailId}`))
        .map(emailId => {
          const email = emails.get(`${emailId}`).toJS();
          const fromTmp = parseContactRow(email.fromAddress || '');
          const from = defineContactFrom(
            contacts,
            email.fromContactIds,
            fromTmp
          );
          const toIds = email.to;
          const to = defineContact(contacts, toIds);
          const ccIds = email.cc;
          const cc = defineContact(contacts, ccIds);
          const bccIds = email.bcc;
          const bcc = defineContact(contacts, bccIds);
          const subject = email.subject || `(${string.mailbox.empty_subject})`;
          return { ...email, from, to, toIds, cc, ccIds, bcc, bccIds, subject };
        })
        .sort(compareEmailDate)
    : [];
  const { emailKeysUnread, emailsUnread } = emailsFiltered
    .filter(email => email.unread)
    .reduce(
      (result, email) => {
        return {
          emailKeysUnread: [...result.emailKeysUnread, email.key],
          emailsUnread: [
            ...result.emailsUnread,
            { id: email.id, unread: false }
          ]
        };
      },
      { emailKeysUnread: [], emailsUnread: [] }
    );
  return { emails: emailsFiltered, emailKeysUnread, emailsUnread };
};

export const makeGetEmails = () => {
  return createSelector(
    [getEmails, getContacts, getEmailIds],
    (emails, contacts, emailIds) => defineEmails(emails, contacts, emailIds)
  );
};
