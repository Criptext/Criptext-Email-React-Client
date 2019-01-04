import React from 'react';
import PropTypes from 'prop-types';
import { SETTINGS_POPUP_TYPES } from './SettingGeneralWrapper';
import string from '../lang';
import './settingsgeneralmanualsync.scss';

const { mailbox_sync } = string.settings;

const SettngsGeneralManualSync = props => {
  const disabled = props.devicesQuantity < 2;
  return (
    <div id="settings-general-mailbox-sync" className="section-block">
      <div className="section-block-title">
        <h1>{mailbox_sync.label}</h1>
      </div>
      <div className="section-block-content">
        <div
          className="section-block-content-item"
          title={disabled ? mailbox_sync.tooltip : ''}
        >
          <button
            className="button-b button-mailbox-sync"
            onClick={() => {
              const popupType = SETTINGS_POPUP_TYPES.MANUAL_SYNC;
              props.onShowSettingsPopup(popupType);
            }}
            disabled={disabled}
          >
            <span>{mailbox_sync.button}</span>
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
