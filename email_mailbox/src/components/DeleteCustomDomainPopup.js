import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';

const DeleteCustomDomainPopup = props => {
  return (
    <div className="popup-content">
      <div className="popup-title">
        <h1>{string.popups.delete_custom_domain.title}</h1>
      </div>
      <div className="popup-paragraph">
        <p>{string.popups.delete_custom_domain.description}</p>
      </div>
      <div className="popup-buttons">
        <button
          className="button-a popup-cancel-button"
          onClick={props.onTogglePopup}
        >
          <span>{string.popups.delete_custom_domain.buttons.cancelLabel}</span>
        </button>
        <button
          className="button-a popup-confirm-button"
          onClick={props.onConfirmDeleteCustomDomain}
        >
          <span>
            {string.popups.delete_custom_domain.buttons.continueLabel}
          </span>
        </button>
      </div>
    </div>
  );
};

DeleteCustomDomainPopup.propTypes = {
  domain: PropTypes.string,
  onTogglePopup: PropTypes.func,
  onConfirmDeleteCustomDomain: PropTypes.func
};

export default DeleteCustomDomainPopup;
