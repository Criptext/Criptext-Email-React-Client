import React from 'react';
import string from './../lang';

const {
  messagelostAllDevices,
  messageEmptyRecoveryEmail,
  messageForgotSentLink,
  messageForgotEmptyEmail,
  messagePermanentDeleteThread
} = string;

export const LostAllDevices = () => {
  const { text, strong } = messagelostAllDevices;
  return (
    <div className="message-lost-all-devices">
      <p>{text}</p>
      <p>
        <strong>{strong}</strong>
      </p>
    </div>
  );
};

export const EmptyRecoveryEmail = () => {
  const { preffix, strong, suffix } = messageEmptyRecoveryEmail;
  return (
    <div className="message-empty-recovery-email">
      <p>
        {preffix} <strong>{strong}</strong> {suffix}
      </p>
    </div>
  );
};

export const ForgotPasswordSentLink = customText => {
  const { defaultText } = messageForgotSentLink;
  const content = customText || defaultText;
  return (
    <div className="message-forgot-sent-link">
      <p>{content}</p>
    </div>
  );
};

export const ForgotPasswordEmptyEmail = customText => (
  <div className="message-forgot-empty-email">
    <p>{customText || messageForgotEmptyEmail.defaultText}</p>
  </div>
);

export const PermanentDeleteThread = () => (
  <div className="message-permanent-delete-thread">
    <p>{messagePermanentDeleteThread.text}</p>
    <p>{messagePermanentDeleteThread.question}</p>
  </div>
);
