import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';
import './manualsyncdevicerejectedpopup.scss';

const {
  title,
  message,
  warning,
  closeButtonLabel
} = string.popups.manual_sync_device_rejected;

const ManualSyncDeviceRejectedPopup = props => (
  <div id="popup-manual-sync-device-rejected" className="popup-content">
    <div className="content">
      <div className="content-header popup-title">
        <h1>{title}</h1>
      </div>

      <div className="message popup-paragraph">
        <p>{message}</p>
      </div>

      <div className="content-icon">
        <div className="icon-warning" />
      </div>

      <div className="message popup-paragraph">
        <p>
          <strong>{warning.strong}: </strong>
          {warning.text}
        </p>
      </div>

      <div className="popup-buttons">
        <button
          className="button-a popup-confirm-button"
          onClick={props.onHideSettingsPopup}
        >
          <span>{closeButtonLabel}</span>
        </button>
      </div>
    </div>
  </div>
);

// eslint-disable-next-line fp/no-mutation
ManualSyncDeviceRejectedPopup.propTypes = {
  onHideSettingsPopup: PropTypes.func
};

export default ManualSyncDeviceRejectedPopup;
