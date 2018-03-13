import React from 'react';
import PropTypes from 'prop-types';
import Recipient from './RecipientWrapper';
import Subject from './SubjectWrapper';
import Body from './BodyWrapper';

const Composer = props => (
  <div className="wrapper">
    <Recipient
      toEmails={props.toEmails}
      ccEmails={props.ccEmails}
      bccEmails={props.bccEmails}
      getToEmails={props.getToEmails}
      getCcEmails={props.getCcEmails}
      getBccEmails={props.getBccEmails}
    />
    <Subject text={props.textSubject} getText={props.getTextSubject} />
    <Body
      onClickSendMessage={props.onClickSendMessage}
      htmlBody={props.htmlBody}
      getHtmlBody={props.getHtmlBody}
      isSendButtonDisabled={props.isSendButtonDisabled}
      isLoadingSendButton={props.isLoadingSendButton}
    />
  </div>
);

Composer.propTypes = {
  bccEmails: PropTypes.array,
  ccEmails: PropTypes.array,
  isSendButtonDisabled: PropTypes.bool,
  isLoadingSendButton: PropTypes.bool,
  getBccEmails: PropTypes.func,
  getCcEmails: PropTypes.func,
  getHtmlBody: PropTypes.func,
  getTextSubject: PropTypes.func,
  getToEmails: PropTypes.func,
  htmlBody: PropTypes.object,
  onClickSendMessage: PropTypes.func,
  textSubject: PropTypes.string,
  toEmails: PropTypes.array
};

export default Composer;
