/* eslint react/no-deprecated: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SettingDevices from './SettingDevices';
import {
  sendRemoveDeviceErrorMessage,
  sendRemoveDeviceSuccessMessage
} from '../utils/electronEventInterface';
import { hashPassword } from '../utils/hashUtils';

class SettingDevicesWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isHiddenRemoveDevicePopup: true,
      deviceId: undefined,
      password: ''
    };
  }

  render() {
    return (
      <SettingDevices
        {...this.props}
        devices={this.props.devices}
        isHiddenRemoveDevicePopup={this.state.isHiddenRemoveDevicePopup}
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
      isHiddenRemoveDevicePopup: false,
      deviceId
    });
  };

  handleChangeRemoveDeviceInputPassword = ev => {
    const password = ev.target.value;
    this.setState({ password });
  };

  handleClickCancelRemoveDevice = () => {
    this.setState({
      isHiddenRemoveDevicePopup: true,
      deviceId: undefined,
      password: ''
    });
  };

  handleRemoveDevice = async () => {
    const params = {
      deviceId: this.state.deviceId,
      password: hashPassword(this.state.password)
    };
    const isSuccess = await this.props.onRemoveDevice(params);
    if (isSuccess) {
      this.setState(
        { isHiddenRemoveDevicePopup: true, deviceId: undefined, password: '' },
        () => {
          sendRemoveDeviceSuccessMessage();
        }
      );
    } else {
      sendRemoveDeviceErrorMessage();
    }
  };
}

SettingDevicesWrapper.propTypes = {
  devices: PropTypes.array,
  onRemoveDevice: PropTypes.func
};

export default SettingDevicesWrapper;
