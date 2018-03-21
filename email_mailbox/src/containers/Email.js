import { connect } from 'react-redux';
import EmailView from '../components/EmailWrapper';
import { defineTimeByToday } from '../utils/TimeUtils';

const mapStateToProps = (state, ownProps) => {
  const email = ownProps.email;
  const contacts = state.get('contacts');
  const from = getContacts(contacts, email.get('from'));
  const to = getContacts(contacts, email.get('to'));
  const cc = getContacts(contacts, email.get('cc'));
  const bcc = getContacts(contacts, email.get('bcc'));
  const myEmail = email.merge({
    date: defineTimeByToday(email.get('date')),
    from,
    to,
    cc,
    bcc
  });
  return {
    email: myEmail.toJS(),
    classStatus: myEmail.get('unsent') ? 'email-unsent' : 'email-normal'
  };
};

const getContacts = (contacts, contactIds) => {
  return !contactIds
    ? []
    : contactIds.toArray().map(contactId => {
        return contacts.size ? contacts.get(contactId) : { id: contactId };
      });
};

const Email = connect(mapStateToProps, null)(EmailView);

export default Email;
