import React from 'react';
import PropTypes from 'prop-types';
import { SETTINGS_POPUP_TYPES } from './SettingGeneralWrapper';
import string from '../lang';
import './settingsgeneralmanualsync.scss';

const { mailbox_sync } = string.settings;

const SettngsGeneralManualSync = props => {
  const disabled = props.devicesQuantity < 2;
  return (
    <div id="cptx-settings-mailbox-sync" className="cptx-section-item">
      <span className="cptx-section-item-title">{mailbox_sync.label}</span>
      <span className="cptx-section-item-description">
        {mailbox_sync.description}
      </span>
      <div
        className="cptx-section-item-control"
        title={disabled ? mailbox_sync.tooltip : ''}
      >
        <button
          className="button-b"
          onClick={() => {
            const popupType = SETTINGS_POPUP_TYPES.MANUAL_SYNC;
            props.onShowSettingsPopup(popupType);
          }}
          disabled={!disabled}
          title={'hello'}
        >
          <span>{mailbox_sync.button}</span>
        </button>
      </div>
    </div>
  );
};

SettngsGeneralManualSync.propTypes = {
  devicesQuantity: PropTypes.number,
  onShowSettingsPopup: PropTypes.func
};

export default SettngsGeneralManualSync;
