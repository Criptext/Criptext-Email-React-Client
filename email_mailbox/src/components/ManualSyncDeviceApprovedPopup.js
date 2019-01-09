import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';
import './manualsyncdeviceapprovedpopup.scss';

const { header, cancelSyncLabel } = string.popups.manual_sync_device_approved;

const ManualSyncDeviceApprovedPopup = props => (
  <div id="popup-manual-sync-device-approved" className="popup-content">
    <div className="popup-title">
      <h1>{header}</h1>
    </div>

    <div className="linking-devices-icons">
      <i className={`${props.oldDeviceIcon} icon-old-device`} />
      <div className="linking-dots">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
      <i className={`${props.newDeviceIcon} icon-new-device`} />
    </div>

    <div className="bar">
      <div
        className={`content running-animation`}
        style={{ width: props.percent + '%' }}
      />
    </div>

    <div className="percent">
      <div className="content">
        <span className="number">{props.percent}%</span>
      </div>
    </div>

    <div className="message popup-paragraph">
      <p className="syncing">{props.message}</p>
    </div>

    <div className="device-name popup-paragraph">
      <p>{props.oldDeviceName}</p>
    </div>

    {props.isCancelable && (
      <button className="button-c" onClick={props.onClickCancelSync}>
        <span>{cancelSyncLabel}</span>
      </button>
    )}
  </div>
);

// eslint-disable-next-line fp/no-mutation
ManualSyncDeviceApprovedPopup.propTypes = {
  newDeviceIcon: PropTypes.string,
  oldDeviceIcon: PropTypes.string,
  oldDeviceName: PropTypes.string,
  percent: PropTypes.number,
  onClickCancelSync: PropTypes.func,
  message: PropTypes.string,
  isCancelable: PropTypes.bool
};

export default ManualSyncDeviceApprovedPopup;
