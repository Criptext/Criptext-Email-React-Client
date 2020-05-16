import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';

import './upgradetopluspopup.scss';

const upgradePlus = string.popups.upgrade_plus;

const UpgradeToPlusPopup = props => {
  return (
    <div className="popup-content">
      <div className={`popup-image popup-image-${props.type}`} />
      <div className="popup-title">
        {props.type === 'alias' ? (
          <h1>{upgradePlus.alias.title}</h1>
        ) : (
          <h1>{upgradePlus.domains.title}</h1>
        )}
      </div>
      <div className="popup-paragraph">
        {props.type === 'alias' ? (
          <p>{upgradePlus.alias.message}</p>
        ) : (
          <p>{upgradePlus.domains.message}</p>
        )}
        <p>{upgradePlus.message}</p>
      </div>
      <div className="popup-buttons">
        <button
          className="button-a popup-cancel-button"
          onClick={props.onTogglePopup}
        >
          <span>{upgradePlus.buttons.cancel}</span>
        </button>
        <button
          className="button-a popup-confirm-button"
          onClick={() => {
            props.onTogglePopup();
            props.onClickSection(string.settings.upgrade_plus);
          }}
        >
          <span>{upgradePlus.buttons.confirm}</span>
        </button>
      </div>
    </div>
  );
};

UpgradeToPlusPopup.propTypes = {
  onClickSection: PropTypes.func,
  onUpgradeToPlus: PropTypes.func,
  onTogglePopup: PropTypes.func,
  type: PropTypes.string
};

export default UpgradeToPlusPopup;
