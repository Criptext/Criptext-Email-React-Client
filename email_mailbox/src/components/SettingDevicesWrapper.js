/* eslint react/no-deprecated: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SettingDevices from './SettingDevices';
import {
  sendRemoveDeviceErrorMessage,
  sendRemoveDeviceSuccessMessage
} from '../utils/electronEventInterface';

class SettingDevicesWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isHiddenRemoveDevicePopup: true,
      deviceId: undefined
    };
  }

  render() {
    return (
      <SettingDevices
        {...this.props}
        devices={this.props.devices}
        deviceId={this.state.deviceId}
        isHiddenRemoveDevicePopup={this.state.isHiddenRemoveDevicePopup}
        onClickCancelRemoveDevice={this.handleClickCancelRemoveDevice}
        onClickRemoveDevice={this.handleClickRemoveDevice}
        onDeviceToRemove={this.handleDeviceToRemove}
      />
    );
  }

  handleClickRemoveDevice = deviceId => {
    this.setState({
      isHiddenRemoveDevicePopup: false,
      deviceId
    });
  };

  handleClickCancelRemoveDevice = () => {
    this.setState({
      isHiddenRemoveDevicePopup: true,
      deviceId: undefined
    });
  };

  handleDeviceToRemove = async params => {
    const status = await this.props.onRemoveDevice(params);
    if (status === 200) {
      this.setState(
        { isHiddenRemoveDevicePopup: true, deviceId: undefined },
        () => {
          sendRemoveDeviceSuccessMessage();
        }
      );
    } else {
      sendRemoveDeviceErrorMessage();
    }
    return status;
  };
}

SettingDevicesWrapper.propTypes = {
  devices: PropTypes.array,
  onRemoveDevice: PropTypes.func
};

export default SettingDevicesWrapper;
