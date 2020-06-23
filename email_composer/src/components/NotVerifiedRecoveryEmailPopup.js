import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';

const NotVerifiedRecoveryEmailPopup = props => {
  return (
    <div className="popup-content">
      <div className="popup-title">
        <h1>{string.popups.notVerifiedRecoveryEmail.title}</h1>
      </div>
      <div className="popup-paragraph">
        <p>{string.popups.notVerifiedRecoveryEmail.description}</p>
      </div>
      <div className="popup-paragraph">
        <p>{string.popups.notVerifiedRecoveryEmail.description_2}</p>
      </div>
      <button
        className="button-a popup-confirm-button"
        onClick={props.onConfirmVerifyRecoveryEmail}
      >
        <span>{string.popups.notVerifiedRecoveryEmail.buttons.send}</span>
      </button>
      <br />
      <button
        className="button-a popup-cancel-button"
        onClick={props.onTogglePopup}
      >
        <span>{string.popups.notVerifiedRecoveryEmail.buttons.cancel}</span>
      </button>
    </div>
  );
};

NotVerifiedRecoveryEmailPopup.propTypes = {
  domain: PropTypes.object,
  onConfirmVerifyRecoveryEmail: PropTypes.func,
  onTogglePopup: PropTypes.func,
  error: PropTypes.string
};

export default NotVerifiedRecoveryEmailPopup;
