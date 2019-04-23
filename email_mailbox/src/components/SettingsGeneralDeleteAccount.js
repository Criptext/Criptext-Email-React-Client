import React from 'react';
import PropTypes from 'prop-types';
import { SETTINGS_POPUP_TYPES } from './SettingGeneralWrapper';
import string from './../lang';
import './settingsgeneraldeleteaccount.scss';

const { delete_account } = string.settings;

const SettingsGeneralDeleteAccount = props => (
  <div id="settings-general-delete-account" className="cptx-section-item">
    <span className="cptx-section-item-title">{delete_account.label}</span>
    <span className="cptx-section-item-description">
      {delete_account.description}
    </span>
    <div className="cptx-section-item-control">
      <button
        className="button-b"
        onClick={() => {
          const popupType = SETTINGS_POPUP_TYPES.DELETE_ACCOUNT;
          props.onShowSettingsPopup(popupType);
        }}
      >
        <i className="icon-exit" />
        <span>{delete_account.button}</span>
      </button>
    </div>
  </div>
);

SettingsGeneralDeleteAccount.propTypes = {
  onShowSettingsPopup: PropTypes.func
};

export default SettingsGeneralDeleteAccount;
