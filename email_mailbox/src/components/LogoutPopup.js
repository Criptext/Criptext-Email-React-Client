import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';

const {
  title,
  paragraphs,
  cancelButtonLabel,
  confirmButtonLabel
} = string.popups.logout;

const LogoutPopup = props => (
  <div className="popup-content">
    <div className="popup-title">
      <h1>{title}</h1>
    </div>
    <div className="popup-paragraph">
      <p>{paragraphs.header}</p>
    </div>
    <div className="popup-buttons">
      <button
        className="button-a popup-cancel-button"
        onClick={props.onTogglePopup}
      >
        <span>{cancelButtonLabel}</span>
      </button>
      <button
        className="button-a popup-confirm-button"
        onClick={props.onConfirmLogout}
      >
        {confirmButtonLabel}
      </button>
    </div>
  </div>
);

LogoutPopup.propTypes = {
  onConfirmLogout: PropTypes.func,
  onTogglePopup: PropTypes.func
};

export default LogoutPopup;
