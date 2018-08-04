/* eslint react/no-deprecated: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SettingDevices from './SettingDevices';

class SettingDevicesWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      devices: []
    };
  }

  componentWillMount() {
    this.setState({ devices: this.props.devices });
  }

  render() {
    return (
      <SettingDevices
        {...this.props}
        devices={this.props.devices}
        onClickRemoveDevice={this.handleClickRemoveDevice}
      />
    );
  }

  componentDidMount() {
    if (!this.state.devices.length) {
      this.setState({ devices: this.props.devices });
    }
  }

  handleClickRemoveDevice = deviceId => {
    const devices = this.state.devices.filter(
      item => item.deviceId !== deviceId
    );
    this.setState({ devices });
  };
}

SettingDevicesWrapper.propTypes = {
  devices: PropTypes.array
};

export default SettingDevicesWrapper;
