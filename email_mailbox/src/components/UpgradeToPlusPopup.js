import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';

const UpgradeToPlusPopup = props => {
  return (
    <div className="popup-content">
      <div className="popup-image">
        <img src="" />
      </div>
      <div className="popup-title">
        <h1>Upgrade to Plus</h1>
      </div>
      <div className="popup-paragraph">
        <p>In order to use this feature you need to be a plus user</p>
      </div>
      <div className="popup-buttons">
        <button
          className="button-a popup-cancel-button"
          onClick={props.onTogglePopup}
        >
          <span>Maybe Later</span>
        </button>
        <button
          className="button-a popup-confirm-button"
          onClick={() => {
            props.onTogglePopup();
            props.onClickSection(string.settings.upgrade_plus);
          }}
        >
          <span>Upgrade</span>
        </button>
      </div>
    </div>
  );
};

UpgradeToPlusPopup.propTypes = {
  onClickSection: PropTypes.func,
  onUpgradeToPlus: PropTypes.func,
  onTogglePopup: PropTypes.func
};

export default UpgradeToPlusPopup;
