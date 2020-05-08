import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';

const DeleteCustomDomainPopup = props => {
  if (props.error) return <DeleteCustomDomainError {...props} />;
  return <DeleteCustomDomainPrompt {...props} />;
};

const DeleteCustomDomainPrompt = props => {
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

const DeleteCustomDomainError = props => {
  return (
    <div className="popup-content">
      <div className="popup-title">
        <h1>{string.popups.delete_custom_domain.errors.title}</h1>
      </div>
      <div className="popup-paragraph">
        <p>{props.error}</p>
      </div>
      <div className="popup-buttons">
        <button
          className="button-a popup-confirm-button"
          onClick={props.onTogglePopup}
        >
          <span>{string.popups.delete_custom_domain.buttons.okLabel}</span>
        </button>
      </div>
    </div>
  );
};

DeleteCustomDomainPopup.propTypes = {
  error: PropTypes.string
};

DeleteCustomDomainPrompt.propTypes = {
  domain: PropTypes.object,
  onTogglePopup: PropTypes.func,
  onConfirmDeleteCustomDomain: PropTypes.func
};

DeleteCustomDomainError.propTypes = {
  domain: PropTypes.object,
  onTogglePopup: PropTypes.func,
  error: PropTypes.string
};

export default DeleteCustomDomainPopup;
