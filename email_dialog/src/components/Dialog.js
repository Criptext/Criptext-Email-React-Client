import React from 'react';
import { remoteData, onResponseModal } from './../utils/electronInterface';
import * as messages from './../utils/contents';
import './dialog.css';

const { title, contentType, options, sendTo } = remoteData;

const Dialog = () => (
  <div className="dialog-body">
    <div className="header" />
    <div className="content">
      <h2 className="title">{title}</h2>
      {renderContent(contentType)}
      {renderOptions(options, sendTo)}
    </div>
  </div>
);

const renderContent = contentType => {
  switch (contentType) {
    case 'EMPTY_RECOVERY_EMAIL':
      return messages.EmptyRecoveryEmail();
    case 'FORGOT_PASSWORD_SENT_LINK':
      return messages.ForgotPasswordSentLink();
    case 'FORGOT_PASSWORD_EMPTY_EMAIL':
      return messages.ForgotPasswordEmptyEmail();
    case 'PERMANENT_DELETE_THREAD':
      return messages.PermanentDeleteThread();
    default:
      return messages.LostAllDevices();
  }
};

const renderOptions = (options, sendTo) => {
  return (
    <div className="options">
      <button
        className={options.acceptLabel !== '' ? 'cancel' : 'hidden'}
        onClick={e => onResponseModal(e, options.cancelLabel, sendTo)}
      >
        <span>{options.cancelLabel}</span>
      </button>
      <button
        className={options.acceptLabel !== '' ? 'confirm' : 'hidden'}
        onClick={e => onResponseModal(e, options.acceptLabel, sendTo)}
      >
        <span>{options.acceptLabel}</span>
      </button>
    </div>
  );
};

export default Dialog;
