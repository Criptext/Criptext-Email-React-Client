import { connect } from 'react-redux';
import EmailView from './../components/EmailWrapper';
import { defineTimeByToday, defineLargeTime } from './../utils/TimeUtils';
import { getTwoCapitalLetters } from './../utils/StringUtils';
import { matchOwnEmail } from './../utils/UserUtils';
import randomcolor from 'randomcolor';
import {
  composerEvents,
  myAccount,
  openEmailInComposer
} from './../utils/electronInterface';
import { muteEmail } from './../actions/index';

const mapStateToProps = (state, ownProps) => {
  const email = ownProps.email;
  const contacts = state.get('contacts');
  const from = getContacts(contacts, email.get('from'));
  const to = getContacts(contacts, email.get('to'));
  const cc = getContacts(contacts, email.get('cc'));
  const bcc = getContacts(contacts, email.get('bcc'));
  const senderName = from.length ? from[0].name : '';
  const senderEmail = from.length ? from[0].email : '';
  const color = senderEmail
    ? randomcolor({
        seed: senderName || senderEmail,
        luminosity: 'bright'
      })
    : 'transparent';
  const letters = getTwoCapitalLetters(senderName || senderEmail || '');
  const subject = email.get('subject');
  const date = email.get('date');
  const myEmail = email.merge({
    date: defineTimeByToday(date),
    dateLong: defineLargeTime(date),
    subject: subject || '(No Subject)',
    from,
    to,
    cc,
    bcc,
    color,
    letters
  });
  return {
    email: myEmail.toJS(),
    attachments: myEmail.get('attachments') ? myEmail.get('attachments') : [],
    isFromMe: matchOwnEmail(myAccount.recipientId, senderEmail)
  };
};

const getContacts = (contacts, contactIds) => {
  return !contactIds
    ? []
    : contactIds.toArray().map(contactId => {
        return contacts.size && contacts.get(contactId)
          ? contacts.get(contactId).toObject()
          : { id: contactId };
      });
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const email = ownProps.email;
  const isLast = ownProps.staticOpen;
  return {
    toggleMute: ev => {
      ev.stopPropagation();
      const emailId = String(email.get('id'));
      const valueToSet = email.get('isMuted') === 1 ? false : true;
      dispatch(muteEmail(emailId, valueToSet));
    },
    onReplyEmail: ev => {
      ev.stopPropagation();
      const key = email.get('key');
      openEmailInComposer({ key, type: composerEvents.REPLY });
    },
    onReplyLast: () => {
      if (isLast) {
        const key = email.get('key');
        openEmailInComposer({ key, type: composerEvents.REPLY });
      }
    },
    onReplyAll: ev => {
      ev.stopPropagation();
      const key = email.get('key');
      openEmailInComposer({ key, type: composerEvents.REPLY_ALL });
    },
    onForward: ev => {
      ev.stopPropagation();
      const key = email.get('key');
      openEmailInComposer({ key, type: composerEvents.FORWARD });
    }
  };
};

const Email = connect(mapStateToProps, mapDispatchToProps)(EmailView);

export default Email;
