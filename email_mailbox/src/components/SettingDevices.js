import React from 'react';
import PropTypes from 'prop-types';
import { deviceTypes } from './../utils/const';
import './settingdevices.css';

const SettingDevices = props => <div>{renderDevicesBlock(props)}</div>;

const renderDevicesBlock = props => (
  <div className="section-block">
    <div className="section-block-title">
      <h1>Linked Devices</h1>
    </div>
    <div className="section-block-content">
      <div className="section-block-content-item content-linked-devices">
        {props.devices.map((device, index) =>
          renderLinkedDevice(index, device, props)
        )}
      </div>
    </div>
  </div>
);

const renderLinkedDevice = (index, deviceData, props) => (
  <div key={index} className="linked-device">
    <div className="device-icon">
      <i className={defineDeviceIconByType(deviceData.type)} />
    </div>
    <div className="device-name">{deviceData.name}</div>
    <div className="device-status">
      {renderLastConnection(deviceData, props)}
    </div>
  </div>
);

const defineDeviceIconByType = type => {
  switch (type) {
    case deviceTypes.PC:
      return 'icon-desktop';
    case deviceTypes.PHONE:
      return 'icon-mobile';
    default:
      return '';
  }
};

const renderLastConnection = (deviceData, props) => {
  const isCurrentDevice = deviceData.name === props.currentDeviceName;
  return isCurrentDevice ? (
    <span className="current-device">Current device</span>
  ) : (
    <div className="device-connection-data">
      <span>{deviceData.lastConnection.place}</span>
      <span>{deviceData.lastConnection.time}</span>
    </div>
  );
};

renderDevicesBlock.propTypes = {
  devices: PropTypes.array
};

renderLastConnection.propTypes = {
  currentDeviceName: PropTypes.string
};

export default SettingDevices;
