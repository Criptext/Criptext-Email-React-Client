import React from 'react';
import PropTypes from 'prop-types';
import { SETTINGS_POPUP_TYPES } from './SettingGeneralWrapper';
import './settingsgeneraldeleteaccount.scss';

const SettingsGeneralDeleteAccount = props => (
  <div id="settings-general-delete-account" className="section-block">
    <div className="section-block-title">
      <h1>Delete Account</h1>
    </div>
    <div className="section-block-content">
      <div className="section-block-content-item">
        <div
          className="delete-account-button"
          onClick={() => {
            const popupType = SETTINGS_POPUP_TYPES.DELETE_ACCOUNT;
            props.onShowSettingsPopup(popupType);
          }}
        >
          <i className="icon-exit" />
          <span>Delete permanently</span>
        </div>
      </div>
    </div>
  </div>
);

SettingsGeneralDeleteAccount.propTypes = {
  onShowSettingsPopup: PropTypes.func
};

export default SettingsGeneralDeleteAccount;
