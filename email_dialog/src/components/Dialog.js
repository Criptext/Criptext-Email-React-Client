import React from 'react';
import { remoteData, onResponseModal } from './../utils/electronInterface';
import * as messages from './../utils/contents';
import './dialog.css';

const Dialog = () => (
  <div className="dialog-body">
    <div className="header" />
    <div className="content">
      <h2 className="title">{remoteData.title}</h2>
      {renderContent(remoteData.contentType)}
      {renderOptions(remoteData.options)}
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
    default:
      return messages.LostAllDevices();
  }
};

const renderOptions = options => {
  return (
    <div className="options">
      <button
        className={options.acceptLabel !== '' ? 'cancel' : 'hidden'}
        onClick={e => onResponseModal(e, options.cancelLabel)}
      >
        <span>{options.cancelLabel}</span>
      </button>
      <button
        className={options.acceptLabel !== '' ? 'confirm' : 'hidden'}
        onClick={e => onResponseModal(e, options.acceptLabel)}
      >
        <span>{options.acceptLabel}</span>
      </button>
    </div>
  );
};

export default Dialog;
