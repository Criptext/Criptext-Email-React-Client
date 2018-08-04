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
import { loadFiles, muteEmail, unsendEmail } from './../actions/index';
import { EmailStatus, unsentText } from '../utils/const';

const mapStateToProps = (state, ownProps) => {
  const email = ownProps.email;
  const contacts = state.get('contacts');
  const from = getContacts(contacts, email.from);
  const to = getContacts(contacts, email.to);
  const cc = getContacts(contacts, email.cc);
  const bcc = getContacts(contacts, email.bcc);
  const senderName = from.length ? from[0].name : '';
  const senderEmail = from.length ? from[0].email : '';
  const color = senderEmail
    ? randomcolor({
        seed: senderName || senderEmail,
        luminosity: 'bright'
      })
    : 'transparent';
  const letters = getTwoCapitalLetters(senderName || senderEmail || '');
  const date = email.date;
  const files = getFiles(state.get('files'), email.fileTokens);
  const preview =
    email.status === EmailStatus.UNSEND ? unsentText : email.preview;
  const content =
    email.status === EmailStatus.UNSEND
      ? `Unsent: At ${defineTimeByToday(email.unsendDate)}`
      : email.content;
  const myEmail = {
    ...email,
    date: defineTimeByToday(date),
    dateLong: defineLargeTime(date),
    subject: email.subject || '(No Subject)',
    from,
    to,
    cc,
    bcc,
    color,
    letters,
    preview,
    content
  };
  const isUnsend = email.status === EmailStatus.UNSEND;
  return {
    email: myEmail,
    files,
    isFromMe: matchOwnEmail(myAccount.recipientId, senderEmail),
    isUnsend
  };
};

const getContacts = (contacts, contactIds) => {
  return contactIds
    ? contactIds.map(contactId => {
        const contact = contacts.get(String(contactId));
        return contacts.size && contact
          ? contact.toObject()
          : { id: contactId };
      })
    : [];
};

const getFiles = (files, fileTokens) => {
  return fileTokens
    ? files.size
      ? fileTokens.filter(token => files.get(token)).map(token => {
          return files.get(token).toJS();
        })
      : []
    : [];
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const email = ownProps.email;
  const isLast = ownProps.staticOpen;
  return {
    toggleMute: ev => {
      ev.stopPropagation();
      const emailId = String(email.id);
      const valueToSet = email.isMuted === 1 ? false : true;
      dispatch(muteEmail(emailId, valueToSet));
    },
    onLoadFiles: tokens => {
      dispatch(loadFiles(tokens));
    },
    onReplyEmail: ev => {
      ev.stopPropagation();
      const keyEmailToRespond = email.key;
      openEmailInComposer({ keyEmailToRespond, type: composerEvents.REPLY });
    },
    onReplyLast: () => {
      if (isLast) {
        const keyEmailToRespond = email.key;
        openEmailInComposer({ keyEmailToRespond, type: composerEvents.REPLY });
      }
    },
    onReplyAll: ev => {
      ev.stopPropagation();
      const keyEmailToRespond = email.key;
      openEmailInComposer({
        keyEmailToRespond,
        type: composerEvents.REPLY_ALL
      });
    },
    onForward: ev => {
      ev.stopPropagation();
      const keyEmailToRespond = email.key;
      openEmailInComposer({ keyEmailToRespond, type: composerEvents.FORWARD });
    },
    unsendEmail: () => {
      const contactIds = [...email.to, ...email.cc, ...email.bcc];
      const unsendDate = new Date();
      const params = {
        key: email.key,
        emailId: email.id,
        contactIds,
        unsendDate
      };
      dispatch(unsendEmail(params));
    }
  };
};

const Email = connect(
  mapStateToProps,
  mapDispatchToProps
)(EmailView);

export default Email;
