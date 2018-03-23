import { connect } from 'react-redux';
import EmailView from '../components/EmailWrapper';
import { defineTimeByToday } from '../utils/TimeUtils';
import { getTwoCapitalLetters } from '../utils/StringUtils';
import randomcolor from 'randomcolor';

const mapStateToProps = (state, ownProps) => {
  const email = ownProps.email;
  const contacts = state.get('contacts');
  const from = getContacts(contacts, email.get('from'));
  const to = getContacts(contacts, email.get('to'));
  const cc = getContacts(contacts, email.get('cc'));
  const bcc = getContacts(contacts, email.get('bcc'));
  const [{ name: senderName, email: senderEmail }] = from;
  const color = senderEmail
    ? randomcolor({
        seed: senderName || senderEmail,
        luminosity: 'bright'
      })
    : 'transparent';
  const letters = getTwoCapitalLetters(senderName || senderEmail || '');
  const myEmail = email.merge({
    date: defineTimeByToday(email.get('date')),
    from,
    to,
    cc,
    bcc,
    color,
    letters
  });
  return {
    email: myEmail.toJS(),
    classStatus: myEmail.get('unsent') ? 'email-unsent' : 'email-normal',
    attachments: myEmail.get('attachments') ? myEmail.get('attachments') : []
  };
};

const getContacts = (contacts, contactIds) => {
  return !contactIds
    ? []
    : contactIds.toArray().map(contactId => {
        return contacts.size
          ? contacts.get(contactId).toObject()
          : { id: contactId };
      });
};

const Email = connect(mapStateToProps, null)(EmailView);

export default Email;
