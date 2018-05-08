import React from 'react';
import PropTypes from 'prop-types';
import Recipient from './RecipientWrapper';
import Subject from './SubjectWrapper';
import Body from './BodyWrapper';
import './composer.css';

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
      status={props.status}
      blockRenderMap={props.blockRenderMap}
      files={props.files}
      isDragActive={props.isDragActive}
      onClearFile={props.onClearFile}
      onDrop={props.onDrop}
      handleDragLeave={props.handleDragLeave}
      handleDragOver={props.handleDragOver}
    />
  </div>
);

Composer.propTypes = {
  bccEmails: PropTypes.array,
  blockRenderMap: PropTypes.object,
  ccEmails: PropTypes.array,
  getBccEmails: PropTypes.func,
  getCcEmails: PropTypes.func,
  getHtmlBody: PropTypes.func,
  getTextSubject: PropTypes.func,
  getToEmails: PropTypes.func,
  htmlBody: PropTypes.object,
  onClickSendMessage: PropTypes.func,
  status: PropTypes.number,
  textSubject: PropTypes.string,
  toEmails: PropTypes.array,
  files: PropTypes.array,
  onDrop: PropTypes.func,
  onClearFile: PropTypes.func,
  handleDragLeave: PropTypes.func,
  handleDragOver: PropTypes.func,
  isDragActive: PropTypes.bool
};

export default Composer;
