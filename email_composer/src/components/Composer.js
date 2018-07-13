import React from 'react';
import PropTypes from 'prop-types';
import RecipientWrapper from './RecipientWrapper';
import SubjectWrapper from './SubjectWrapper';
import BodyWrapper from './BodyWrapper';
import NonCriptextWrapper from './NonCriptextWrapper';
import './composer.css';

const Composer = props => (
  <div className="wrapper">
    <RecipientWrapper
      disableSendButton={props.disableSendButtonOnInvalidEmail}
      toEmails={props.toEmails}
      ccEmails={props.ccEmails}
      bccEmails={props.bccEmails}
      getToEmails={props.getToEmails}
      getCcEmails={props.getCcEmails}
      getBccEmails={props.getBccEmails}
      isCollapsedMoreRecipient={props.isCollapsedMoreRecipient}
      onToggleRecipient={props.onToggleRecipient}
    />
    <SubjectWrapper
      getText={props.getTextSubject}
      onFocusInput={props.onToggleRecipient}
      text={props.textSubject}
    />
    <BodyWrapper
      blockRenderMap={props.blockRenderMap}
      files={props.files}
      getHtmlBody={props.getHtmlBody}
      handleDragLeave={props.handleDragLeave}
      handleDragOver={props.handleDragOver}
      htmlBody={props.htmlBody}
      isDragActive={props.isDragActive}
      onClearFile={props.onClearFile}
      onClickDiscardDraft={props.onClickDiscardDraft}
      onClickSendMessage={props.onClickSendMessage}
      onDrop={props.onDrop}
      onFocusTextEditor={props.onToggleRecipient}
      onPauseUploadFile={props.handlePauseUploadFile}
      onResumeUploadFile={props.handleResumeUploadFile}
      status={props.status}
    />
    {props.displayNonCriptextPopup && (
      <NonCriptextWrapper
        onClickSendMessage={props.onClickSendMessage}
        onClickCancelSendMessage={props.onClickCancelSendMessage}
      />
    )}
  </div>
);

Composer.propTypes = {
  addFiletoken: PropTypes.func,
  bccEmails: PropTypes.array,
  blockRenderMap: PropTypes.object,
  ccEmails: PropTypes.array,
  disableSendButtonOnInvalidEmail: PropTypes.func,
  files: PropTypes.array,
  getBccEmails: PropTypes.func,
  getCcEmails: PropTypes.func,
  getHtmlBody: PropTypes.func,
  getTextSubject: PropTypes.func,
  getToEmails: PropTypes.func,
  handleDragLeave: PropTypes.func,
  handleDragOver: PropTypes.func,
  handlePauseUploadFile: PropTypes.func,
  handleResumeUploadFile: PropTypes.func,
  htmlBody: PropTypes.object,
  isCollapsedMoreRecipient: PropTypes.bool,
  isDragActive: PropTypes.bool,
  onDrop: PropTypes.func,
  onClearFile: PropTypes.func,
  onClickDiscardDraft: PropTypes.func,
  onClickSendMessage: PropTypes.func,
  onToggleRecipient: PropTypes.func,
  status: PropTypes.number,
  textSubject: PropTypes.string,
  toEmails: PropTypes.array
};

export default Composer;
