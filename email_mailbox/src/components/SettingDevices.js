import React from 'react';
import PropTypes from 'prop-types';
import { deviceTypes } from './../utils/const';
import PopupHOC from './PopupHOC';
import RemoveDevicePopupWrapper from './RemoveDevicePopupWrapper';
import string from './../lang';
import './settingdevices.scss';

const Removedevicepopup = PopupHOC(RemoveDevicePopupWrapper);

const SettingDevices = props => (
  <div id="setting-devices">{renderDevicesBlock(props)}</div>
);

const renderDevicesBlock = props => (
  <div className="cptx-section-block">
    {!props.isHiddenRemoveDevicePopup && renderRemoveDevicePopup(props)}
    <div className="cptx-section-block-title">
      <h1>{string.settings.linked_devices}</h1>
    </div>
    <div className="cptx-section-block-content">
      {props.devices.map((device, index) =>
        renderTrustedDevice(index, device, props)
      )}
    </div>
  </div>
);

const renderRemoveDevicePopup = props => (
  <Removedevicepopup
    isHidden={props.isHiddenRemoveDevicePopup}
    popupPosition={{ left: '45%', top: '45%' }}
    onTogglePopup={props.onClickCancelRemoveDevice}
    theme={'dark'}
    {...props}
  />
);

const renderTrustedDevice = (index, deviceData, props) => (
  <div key={index} className="cptx-section-item">
    <div className="device-icon">
      <i className={defineDeviceIconByType(deviceData.type)} />
    </div>
    <div className="device-name">
      <span>{deviceData.name}</span>
    </div>
    {deviceData.isCurrentDevice && (
      <div className="device-status">
        <span className="current-device">{string.settings.current_device}</span>
      </div>
    )}
    {deviceData.lastConnection.time &&
      !deviceData.isCurrentDevice && (
        <div className="device-status">
          {renderLastConnection(deviceData.lastConnection)}
        </div>
      )}
    {!deviceData.isCurrentDevice && (
      <button
        className="button-b"
        onClick={() => props.onClickRemoveDevice(deviceData.deviceId)}
      >
        {string.settings.remove}
      </button>
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
  const { time } = lastConnection;
  return time ? (
    <div className="device-connection-data">
      <span>{`${string.settings.last_activity}:`}</span>
      <span>{lastConnection.time}</span>
    </div>
  ) : null;
};

renderDevicesBlock.propTypes = {
  devices: PropTypes.array,
  isHiddenRemoveDevicePopup: PropTypes.bool
};

renderRemoveDevicePopup.propTypes = {
  isHiddenRemoveDevicePopup: PropTypes.bool,
  onClickCancelRemoveDevice: PropTypes.func
};

renderTrustedDevice.propTypes = {
  onClickRemoveDevice: PropTypes.func
};

export default SettingDevices;
