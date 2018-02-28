import React from 'react';

export const LostAllDevices = () => (
  <div className="message">
    <p>
      With your privacy in mind, Criptext doesn&#39;t keep any of your data
      stored in its servers. If you no longer have access to a device linked to
      your account, you&#39;ll start with a brand new inbox.
    </p>
  </div>
);

export const EmptyRecoveryEmail = () => (
  <div className="message">
    <p>
      You did not set a <strong>Recovery Email</strong> so account recovery is
      impossible if you forget your password.
    </p>
    <p>Proceed without recovery email?</p>
  </div>
);
