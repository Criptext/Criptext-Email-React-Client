import React from 'react';
import PropTypes from 'prop-types';
import { deviceTypes } from './../utils/const';
import RemoveDevicePopup from './RemoveDevicePopup';
import './settingdevices.css';

const SettingDevices = props => <div>{renderDevicesBlock(props)}</div>;

const renderDevicesBlock = props => (
  <div className="section-block">
    {props.displayRemoveDevicePopup && renderRemoveDevicePopup(props)}
    <div className="section-block-title">
      <h1>Linked Devices</h1>
    </div>
    <div className="section-block-content">
      <div className="section-block-content-item content-linked-devices">
        {props.devices.map((device, index) =>
          renderTrustedDevice(index, device, props)
        )}
      </div>
    </div>
  </div>
);

const renderRemoveDevicePopup = props => <RemoveDevicePopup {...props} />;

const renderTrustedDevice = (index, deviceData, props) => (
  <div key={index} className="linked-device">
    <div className="device-icon">
      <i className={defineDeviceIconByType(deviceData.type)} />
    </div>
    <div className="device-name">{deviceData.name}</div>
    <div className="device-status">
      {deviceData.isCurrentDevice ? (
        <span className="current-device">Current device</span>
      ) : (
        renderLastConnection(deviceData.lastConnection)
      )}
    </div>
    {!deviceData.isCurrentDevice && (
      <div
        className="device-action"
        onClick={() => props.onClickRemoveDevice(deviceData.deviceId)}
      >
        Remove
      </div>
    )}
  </div>
);

const defineDeviceIconByType = type => {
  switch (type) {
    case deviceTypes.IOS:
      return 'icon-mobile';
    case deviceTypes.ANDROID:
      return 'icon-mobile';
    default:
      return 'icon-desktop';
  }
};

const renderLastConnection = lastConnection => {
  const { place, time } = lastConnection;
  return place && time ? (
    <div className="device-connection-data">
      <span>{lastConnection.place}</span>
      <span>{lastConnection.time}</span>
    </div>
  ) : null;
};

renderDevicesBlock.propTypes = {
  devices: PropTypes.array,
  displayRemoveDevicePopup: PropTypes.bool
};

renderTrustedDevice.propTypes = {
  onClickRemoveDevice: PropTypes.func
};

export default SettingDevices;
