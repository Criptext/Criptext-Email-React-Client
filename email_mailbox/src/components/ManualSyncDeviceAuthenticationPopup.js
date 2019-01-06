import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';
import './manualsyncdeviceauthenticationpopup.scss';
import './manualsyncdeviceauthenticationloading.scss';

const {
  title,
  message,
  getPromptLabel,
  buttons,
  cancelSyncLabel
} = string.popups.manual_sync_device_authentication;

const ManualSyncDeviceAuthenticationPopup = props => (
  <div id="popup-manual-sync-device-authentication" className="popup-content">
    <div className="content">
      <div className="content-header popup-title">
        <h1>{title}</h1>
      </div>

      <div className="message popup-paragraph">
        <p>{message}</p>
      </div>

      <div className="loading">
        <div className="icon-clock" />
        <div className="loader">
          <div className="loader-arrow" />
        </div>
        <div className="roller">
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
        </div>
      </div>

      <div className="prompt popup-paragraph">
        <p>{getPromptLabel}</p>
        <button
          className="resend-button"
          onClick={props.onClickResendLoginRequest}
        >
          <span>{buttons.resend}</span>
        </button>
      </div>

      <div className="cancel-sync">
        <span onClick={props.onHideSettingsPopup}>{cancelSyncLabel}</span>
      </div>
    </div>
  </div>
);

// eslint-disable-next-line fp/no-mutation
ManualSyncDeviceAuthenticationPopup.propTypes = {
  disabledResendLoginRequest: PropTypes.bool,
  hasTwoFactorAuth: PropTypes.bool,
  onClickSignInWithPassword: PropTypes.func,
  onClickResendLoginRequest: PropTypes.func,
  onHideSettingsPopup: PropTypes.func
};

export default ManualSyncDeviceAuthenticationPopup;
