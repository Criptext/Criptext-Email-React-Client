import React from 'react';
import { remoteData, onResponseDialog } from './../utils/electronInterface';
import * as messages from './../utils/contents';
import './dialog.scss';

const { title, contentType, options, sendTo, customTextToReplace } = remoteData;

const Dialog = () => (
  <div className="dialog-body">
    <div className="header" />
    <div className="content">
      <h2 className="title">{title}</h2>
      {renderContent(customTextToReplace, contentType)}
      {renderOptions(options, sendTo)}
    </div>
  </div>
);

const renderContent = (customText, contentType) => {
  switch (contentType) {
    case 'EMPTY_RECOVERY_EMAIL':
      return messages.EmptyRecoveryEmail();
    case 'FORGOT_PASSWORD_SEND_LINK':
      return messages.ForgotPasswordSentLink(customText);
    case 'FORGOT_PASSWORD_EMPTY_EMAIL':
      return messages.ForgotPasswordEmptyEmail(customText);
    case 'PERMANENT_DELETE_THREAD':
      return messages.PermanentDeleteThread();
    default:
      return messages.LostAllDevices();
  }
};

const renderOptions = (options, sendTo) => {
  return (
    <div className="options">
      {options.cancelLabel && (
        <button
          className="cancel"
          onClick={e => onResponseDialog(e, options.cancelLabel, sendTo)}
        >
          <span>{options.cancelLabel}</span>
        </button>
      )}
      {options.acceptLabel && (
        <button
          className="confirm"
          onClick={e => onResponseDialog(e, options.acceptLabel, sendTo)}
        >
          <span>{options.acceptLabel}</span>
        </button>
      )}
    </div>
  );
};

export default Dialog;
