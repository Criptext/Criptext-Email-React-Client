import React from 'react';
import PropTypes from 'prop-types';
import string from '../lang';
import './twofactorauthenabledpopup.scss';

const TwoFactorAuthEnabledPopup = props => (
  <div id="popup-twofactorenabled" className="popup-content">
    <div className="popup-title">
      <h1>{string.popups.two_fa.title}</h1>
    </div>
    <div className="popup-paragraph">
      <p>{string.popups.two_fa.paragraph}</p>
    </div>
    <div className="popup-buttons">
      <button
        className="button-a popup-confirm-button"
        onClick={props.onClickCloseTwoFactorEnabledPopup}
      >
        <span>{string.popups.two_fa.button}</span>
      </button>
    </div>
  </div>
);

TwoFactorAuthEnabledPopup.propTypes = {
  onClickCloseTwoFactorEnabledPopup: PropTypes.func
};

export default TwoFactorAuthEnabledPopup;
