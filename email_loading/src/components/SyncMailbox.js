import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';
import './linkingdevices.scss';

const { header, cancelSyncLabel } = string.linkOldDevice;

const SyncMailbox = props => (
  <div className="dialog-container link-container">
    <div className="dialog-content">
      <div className="dialog-content-header">
        <h1>{header}</h1>
      </div>
      <div className="dialog-content-body">
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
        <div className="message">
          <span className="syncing">{props.message}</span>
        </div>
        <div className="device-name">
          <span>{props.oldDeviceName}</span>
        </div>
        {props.isCancelable && (
          <div className="cancel-sync-link" onClick={props.onClickCancelSync}>
            <span>{cancelSyncLabel}</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

SyncMailbox.propTypes = {
  isCancelable: PropTypes.bool,
  message: PropTypes.string,
  newDeviceIcon: PropTypes.string,
  oldDeviceIcon: PropTypes.string,
  oldDeviceName: PropTypes.string,
  onClickCancelSync: PropTypes.func,
  percent: PropTypes.number
};

export default SyncMailbox;
