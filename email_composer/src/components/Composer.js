import React from 'react';
import PropTypes from 'prop-types';
import FromWrapper from './FromWrapper';
import RecipientWrapper from './RecipientWrapper';
import SubjectWrapper from './SubjectWrapper';
import BodyWrapper from './BodyWrapper';
import NonCriptextPopupWrapper from './NonCriptextPopupWrapper';
import { Status } from './Control';
import { mySettings } from '../utils/electronInterface';
import './composer.scss';

const Composer = props => (
  <div className="wrapper" data-theme={mySettings.theme || 'light'}>
    <FromWrapper />
    <RecipientWrapper
      disableSendButton={props.disableSendButtonOnInvalidEmail}
      toEmails={props.toEmails}
      ccEmails={props.ccEmails}
      bccEmails={props.bccEmails}
      getToEmails={props.getToEmails}
      getCcEmails={props.getCcEmails}
      getBccEmails={props.getBccEmails}
      isCollapsedMoreRecipient={props.isCollapsedMoreRecipient}
      isFocusRecipientInput={props.isFocusRecipientInput}
      onToggleRecipient={props.onToggleRecipient}
      tagBlured={props.tagBlured}
      tagChanged={props.tagChanged}
      tagUpdated={props.tagUpdated}
    />
    <SubjectWrapper
      getText={props.getTextSubject}
      isFocusSubjectInput={props.isFocusSubjectInput}
      onFocusInput={props.onToggleRecipient}
      text={props.textSubject}
    />
    <BodyWrapper
      files={props.files}
      getHtmlBody={props.getHtmlBody}
      htmlBody={props.htmlBody}
      isDragActive={props.isDragActive}
      isFocusEditorInput={props.isFocusEditorInput}
      onClearFile={props.onClearFile}
      onClickDiscardDraft={props.onClickDiscardDraft}
      onClickSendMessage={props.onClickSendMessage}
      onDragLeave={props.onDragLeave}
      onDragOver={props.onDragOver}
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
    {(props.status === Status.WAITING ||
      props.status === Status.INITIALIZING ||
      props.isLinkingDevices) && <div className="composer-disable" />}
  </div>
);

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
  handlePauseUploadFile: PropTypes.func,
  handleResumeUploadFile: PropTypes.func,
  htmlBody: PropTypes.string,
  isCollapsedMoreRecipient: PropTypes.bool,
  isDragActive: PropTypes.bool,
  isFocusEditorInput: PropTypes.bool,
  isFocusRecipientInput: PropTypes.bool,
  isFocusSubjectInput: PropTypes.bool,
  isLinkingDevices: PropTypes.bool,
  onClickCancelSendMessage: PropTypes.func,
  onDragLeave: PropTypes.func,
  onDrop: PropTypes.func,
  onClearFile: PropTypes.func,
  onClickDiscardDraft: PropTypes.func,
  onClickSendMessage: PropTypes.func,
  onDragOver: PropTypes.func,
  onSetNonCriptextRecipientsPassword: PropTypes.func,
  onToggleRecipient: PropTypes.func,
  status: PropTypes.number,
  tagBlured: PropTypes.func,
  tagChanged: PropTypes.func,
  textSubject: PropTypes.string,
  tagUpdated: PropTypes.func,
  toEmails: PropTypes.array
};

export default Composer;
