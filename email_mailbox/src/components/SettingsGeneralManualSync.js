import React from 'react';
import PropTypes from 'prop-types';
import { SETTINGS_POPUP_TYPES } from './SettingGeneralWrapper';
import string from '../lang';
import './settingsgeneralmanualsync.scss';

const { manual_sync } = string.settings;

const SettngsGeneralManualSync = props => {
  const disabled = props.devicesQuantity < 2;
  return (
    <div id="settings-general-manual-sync" className="section-block">
      <div className="section-block-title">
        <h1>{manual_sync.label}</h1>
      </div>
      <div className="section-block-content">
        <div
          className="section-block-content-item"
          title={disabled ? manual_sync.tooltip : ''}
        >
          <button
            className="button-a button-manual-sync"
            onClick={() => {
              const popupType = SETTINGS_POPUP_TYPES.MANUAL_SYNC;
              props.onShowSettingsPopup(popupType);
            }}
            disabled={disabled}
          >
            <span>{manual_sync.button}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

SettngsGeneralManualSync.propTypes = {
  devicesQuantity: PropTypes.number,
  onShowSettingsPopup: PropTypes.func
};

export default SettngsGeneralManualSync;
