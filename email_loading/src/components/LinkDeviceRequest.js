import React from 'react';
import PropTypes from 'prop-types';
import { DEVICE_TYPE } from '../utils/const';
import string from './../lang';

const { linkDeviceRequest } = string;

const LinkDeviceRequest = props => (
  <div className="dialog-container">
    <div className="dialog-content">
      <div className="dialog-content-header">
        <h1>{linkDeviceRequest.header}</h1>
      </div>
      <div className="dialog-content-body">
        <h3>{linkDeviceRequest.text}</h3>
        {renderDeviceInfo(props)}
      </div>
      <div className="dialog-content-buttons">
        <button
          className="button-a button-cancel"
          onClick={props.onDenyLinkDeviceRequest}
        >
          <span>{linkDeviceRequest.buttonLabels.reject}</span>
        </button>
        <button
          className="button-a button-confirm"
          onClick={props.onAcceptLinkDeviceRequest}
        >
          <span>{linkDeviceRequest.buttonLabels.approve}</span>
        </button>
      </div>
    </div>
  </div>
);

const renderDeviceInfo = props => {
  const iconClass =
    props.deviceType === DEVICE_TYPE ? 'icon-desktop' : 'icon-mobile';
  return (
    <p className="device-info">
      <i className={iconClass} />
      <span className="device-name">{props.deviceFriendlyName}</span>
    </p>
  );
};

LinkDeviceRequest.propTypes = {
  onDenyLinkDeviceRequest: PropTypes.func,
  onAcceptLinkDeviceRequest: PropTypes.func
};

renderDeviceInfo.propTypes = {
  deviceType: PropTypes.string,
  deviceFriendlyName: PropTypes.string
};

export default LinkDeviceRequest;
