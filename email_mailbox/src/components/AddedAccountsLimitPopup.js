import React from 'react';
import PropTypes from 'prop-types';
import string from '../lang';

const { title, paragraph, buttonLabel } = string.popups.added_accounts_limit;

const AddedAccountsLimitPopup = props => (
  <div className="popup-content">
    <div className="popup-title">
      <h1>{title}</h1>
    </div>
    <div className="popup-paragraph">
      <p>{paragraph}</p>
    </div>
    <div className="popup-buttons">
      <button
        className="button-a popup-confirm-button"
        onClick={props.onTogglePopup}
      >
        {buttonLabel}
      </button>
    </div>
  </div>
);

AddedAccountsLimitPopup.propTypes = {
  onTogglePopup: PropTypes.func
};

export default AddedAccountsLimitPopup;
