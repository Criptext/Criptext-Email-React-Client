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
    <div className="popup-title">
      <h1>{title}</h1>
    </div>

    <div className="popup-paragraph">
      <p>{message}</p>
    </div>

    <div className="popup-paragraph">
      <i className="icon-warning" />
    </div>

    <div className="popup-paragraph">
      <p>
        <strong>{warning.strong}: </strong>
        {warning.text}
      </p>
    </div>

    <div className="popup-buttons">
      <button
        className="button-a popup-confirm-button"
        onClick={props.onTogglePopup}
      >
        <span>{closeButtonLabel}</span>
      </button>
    </div>
  </div>
);

ManualSyncDeviceRejectedPopup.propTypes = {
  onTogglePopup: PropTypes.func
};

export default ManualSyncDeviceRejectedPopup;
