import React from 'react';
import string from '../lang';

const { title, paragraph } = string.popups.suspended_account;

const SuspendedAccountPopup = () => {
  return (
    <div className="popup-content">
      <div className="popup-title">
        <h1>{title}</h1>
      </div>
      <div className="popup-paragraph">
        <p>{paragraph}</p>
      </div>
    </div>
  );
};

export default SuspendedAccountPopup;
