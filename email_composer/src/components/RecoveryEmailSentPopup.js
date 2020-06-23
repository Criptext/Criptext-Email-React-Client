import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';

const RecoveryEmailSentPopup = props => {
  return (
    <div id="cptx-popup-container" className="popup-content">
      <div className="popup-paragraph">
        <p>{string.popups.recoveryEmailSentPopup.description}</p>
      </div>
      <button
        className="button-a popup-confirm-button"
        onClick={props.onTogglePopup}
      >
        <span>{string.popups.recoveryEmailSentPopup.buttons.ok}</span>
      </button>
    </div>
  );
};

RecoveryEmailSentPopup.propTypes = {
  onTogglePopup: PropTypes.func
};

export default RecoveryEmailSentPopup;
