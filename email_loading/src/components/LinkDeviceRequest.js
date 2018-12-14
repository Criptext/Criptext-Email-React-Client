import React from 'react';
import PropTypes from 'prop-types';
import { DEVICE_TYPE } from '../utils/const';
import string from './../lang';
import './linkdevicerequest.scss';

const { linkDeviceRequest } = string;

const LinkingDevices = props => (
  <div className="request-container">
    <div className="content">
      <div className="header">
        <h3>{linkDeviceRequest.header}</h3>
      </div>
      <div className="question">
        <span className="text">{linkDeviceRequest.text}</span>
      </div>
      {renderDeviceInfo(props)}
      <div className="buttons">
        <button
          className="button-a reject-button"
          onClick={props.onDenyLinkDeviceRequest}
        >
          <span>{linkDeviceRequest.buttonLabels.reject}</span>
        </button>
        <button
          className="button-a aprove-button"
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
    <div className="device-info">
      <i className={iconClass} />
      <span className="device-name">{props.deviceFriendlyName}</span>
    </div>
  );
};

LinkingDevices.propTypes = {
  onDenyLinkDeviceRequest: PropTypes.func,
  onAcceptLinkDeviceRequest: PropTypes.func
};

renderDeviceInfo.propTypes = {
  deviceType: PropTypes.string,
  deviceFriendlyName: PropTypes.string
};

export default LinkingDevices;
