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
      displayRemoveDevicePopup: false,
      deviceId: undefined,
      password: ''
    };
  }

  render() {
    return (
      <SettingDevices
        {...this.props}
        devices={this.props.devices}
        displayRemoveDevicePopup={this.state.displayRemoveDevicePopup}
        onChangeRemoveDeviceInputPassword={
          this.handleChangeRemoveDeviceInputPassword
        }
        onClickCancelRemoveDevice={this.handleClickCancelRemoveDevice}
        onClickRemoveDevice={this.handleClickRemoveDevice}
        onRemoveDevice={this.handleRemoveDevice}
        password={this.state.password}
      />
    );
  }

  handleClickRemoveDevice = deviceId => {
    this.setState({
      displayRemoveDevicePopup: true,
      deviceId
    });
  };

  handleChangeRemoveDeviceInputPassword = ev => {
    const password = ev.target.value;
    this.setState({ password });
  };

  handleClickCancelRemoveDevice = () => {
    this.setState({
      displayRemoveDevicePopup: false,
      deviceId: undefined,
      password: ''
    });
  };

  handleRemoveDevice = () => {
    this.setState({ displayRemoveDevicePopup: false }, async () => {
      const { deviceId } = this.state;
      const isSuccess = await this.props.onRemoveDevice({ deviceId });
      if (isSuccess) {
        sendRemoveDeviceSuccessMessage();
      } else {
        sendRemoveDeviceErrorMessage();
      }
    });
  };
}

SettingDevicesWrapper.propTypes = {
  devices: PropTypes.array,
  onRemoveDevice: PropTypes.func
};

export default SettingDevicesWrapper;
