import React from 'react';

export const LostAllDevices = () => (
  <div className="message-lost-all-devices">
    <p>
      You can also login using your password, however you won&#39;t have access
      to any email history that&#39;s stored on your verified devices.
    </p>
  </div>
);

export const EmptyRecoveryEmail = () => {
  return (
    <div className="message-empty-recovery-email">
      <p>
        You did not set a <strong>Recovery Email</strong> so account recovery is
        impossible if you forget your password.
      </p>
    </div>
  );
};

export const ForgotPasswordSentLink = customText => {
  const content =
    customText ||
    `A reset link was sent to your Recovery email\nThe link will be valid for 30 min`;
  return (
    <div className="message-forgot-sent-link">
      <p>{content}</p>
    </div>
  );
};

export const ForgotPasswordEmptyEmail = customText => (
  <div className="message-forgot-empty-email">
    <p>
      {customText || `You need to set a Recovery Email to reset your password`}
    </p>
  </div>
);

export const PermanentDeleteThread = () => (
  <div className="message-permanent-delete-thread">
    <p>
      This elements will be permanently deleted and you will not be able to
      recover them.
    </p>
    <p>Are you sure?</p>
  </div>
);
