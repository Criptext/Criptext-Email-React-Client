import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';
import './upgradetoplus.scss';

const { upgradePlus } = string.popUp;

const UpgradeToPlusPopup = props => {
  return (
    <div className="popup-content">
      <div className="popup-image" />
      <div className="popup-title">
        <h1>{upgradePlus.title}</h1>
      </div>
      <div className="popup-paragraph">
        <p>{string.formatString(upgradePlus.message, 2)}</p>
      </div>
      <div className="popup-buttons">
        <button
          className="button-a popup-cancel-button"
          onClick={props.onDismiss}
        >
          <span>{upgradePlus.buttons.cancel}</span>
        </button>
        <button
          className="button-a popup-confirm-button"
          onClick={props.upgradeToPlus}
        >
          <span>{upgradePlus.buttons.confirm}</span>
        </button>
      </div>
    </div>
  );
};

UpgradeToPlusPopup.propTypes = {
  onDismiss: PropTypes.func,
  upgradeToPlus: PropTypes.func
};

export default UpgradeToPlusPopup;
