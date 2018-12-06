import React from 'react';
import PropTypes from 'prop-types';
import string from '../lang';

const { title, paragraphs } = string.popups.account_deleted;

const AccountDeletedPopup = () => {
  return (
    <div className="popup-content">
      <div className="popup-title">
        <h1>{title}</h1>
      </div>
      <div className="popup-paragraph">
        <p>{paragraphs.header}</p>
      </div>
    </div>
  );
};

AccountDeletedPopup.propTypes = {
  title: PropTypes.string
};

export default AccountDeletedPopup;
