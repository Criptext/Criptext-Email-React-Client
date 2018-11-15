import React from 'react';
import PropTypes from 'prop-types';
import './twofactorauthenabledpopup.scss';

const TwoFactorAuthEnabledPopup = props => (
  <div id="popup-twofactorenabled" className="popup-content">
    <div className="popup-title">
      <h1>2FA Enabled!</h1>
    </div>
    <div className="popup-paragraph">
      <p>
        Next time you sign into your account on another device you&#39;ll have
        to enter your password and then validate the sign in from an existing
        device.
      </p>
    </div>
    <div className="popup-buttons">
      <button
        className="button-a popup-confirm-button"
        onClick={props.onClickCloseTwoFactorEnabledPopup}
      >
        <span>Got it</span>
      </button>
    </div>
  </div>
);

TwoFactorAuthEnabledPopup.propTypes = {
  onClickCloseTwoFactorEnabledPopup: PropTypes.func
};

export default TwoFactorAuthEnabledPopup;
