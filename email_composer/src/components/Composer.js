import React from 'react';
import PropTypes from 'prop-types';
import RecipientWrapper from './RecipientWrapper';
import SubjectWrapper from './SubjectWrapper';
import BodyWrapper from './BodyWrapper';
import NonCriptextPopupWrapper from './NonCriptextPopupWrapper';
import { Status } from './Control';
import './composer.scss';

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
      isFocusEditorInput={props.isFocusEditorInput}
      onToggleRecipient={props.onToggleRecipient}
    />
    <SubjectWrapper
      getText={props.getTextSubject}
      onFocusInput={props.onToggleRecipient}
      text={props.textSubject}
    />
    <BodyWrapper
      files={props.files}
      getHtmlBody={props.getHtmlBody}
      handleDragLeave={props.handleDragLeave}
      handleDragOver={props.handleDragOver}
      htmlBody={props.htmlBody}
      isDragActive={props.isDragActive}
      isFocusEditorInput={props.isFocusEditorInput}
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
      <NonCriptextPopupWrapper
        onClickSendMessage={props.onClickSendMessage}
        onClickCancelSendMessage={props.onClickCancelSendMessage}
        onSetNonCriptextRecipientsPassword={
          props.onSetNonCriptextRecipientsPassword
        }
      />
    )}
    <div className={defineBackdropClass(props)} />
  </div>
);

const defineBackdropClass = props => {
  if (props.status === Status.WAITING) {
    return 'compposer-sending-backdrop';
  }
  if (props.isLinkingDevices) {
    return 'composer-linking-backdrop';
  }
  return '';
};

Composer.propTypes = {
  addFiletoken: PropTypes.func,
  bccEmails: PropTypes.array,
  ccEmails: PropTypes.array,
  disableSendButtonOnInvalidEmail: PropTypes.func,
  displayNonCriptextPopup: PropTypes.bool,
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
  htmlBody: PropTypes.string,
  isCollapsedMoreRecipient: PropTypes.bool,
  isDragActive: PropTypes.bool,
  isFocusEditorInput: PropTypes.bool,
  onClickCancelSendMessage: PropTypes.func,
  onDrop: PropTypes.func,
  onClearFile: PropTypes.func,
  onClickDiscardDraft: PropTypes.func,
  onClickSendMessage: PropTypes.func,
  onSetNonCriptextRecipientsPassword: PropTypes.func,
  onToggleRecipient: PropTypes.func,
  status: PropTypes.number,
  textSubject: PropTypes.string,
  toEmails: PropTypes.array
};

export default Composer;
