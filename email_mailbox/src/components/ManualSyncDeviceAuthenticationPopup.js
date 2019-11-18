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
    <div className="popup-title">
      <h1>{title}</h1>
    </div>

    <div className="popup-paragraph">
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

    <div className="popup-paragraph">
      <p>{getPromptLabel}</p>
    </div>

    <div className="popup-buttons">
      <button
        className="button-a popup-confirm-button"
        onClick={props.onClickResendSync}
        disabled={props.disabledSubmitButtons}
      >
        <span>
          {props.disabledSubmitButtons ? buttons.sending : buttons.resend}
        </span>
      </button>
    </div>

    <button className="button button-c">
      <span onClick={props.onClickCancelSync}>{cancelSyncLabel}</span>
    </button>
  </div>
);

ManualSyncDeviceAuthenticationPopup.propTypes = {
  disabledSubmitButtons: PropTypes.bool,
  onClickResendSync: PropTypes.func,
  onClickCancelSync: PropTypes.func
};

export default ManualSyncDeviceAuthenticationPopup;
