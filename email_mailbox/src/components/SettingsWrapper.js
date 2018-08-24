import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Settings from './Settings';

class SettingsWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sectionSelected: 'general',
      devices: []
    };
  }

  render() {
    return (
      <Settings
        {...this.props}
        devices={this.state.devices}
        onClickContactSupport={this.props.onComposeContactSupportEmail}
        onClickSection={this.handleClickSection}
        onRemoveDevice={this.handleRemoveDevice}
        sectionSelected={this.state.sectionSelected}
      />
    );
  }

  async componentDidMount() {
    const devices = await this.props.onGetDevices();
    this.setState({ devices });
  }

  handleClickSection = section => {
    this.setState({ sectionSelected: section });
  };

  handleRemoveDevice = async ({ deviceId }) => {
    const isSuccess = await this.props.onRemoveDevice(deviceId);
    if (isSuccess) {
      const devices = this.state.devices.filter(
        item => item.deviceId !== deviceId
      );
      this.setState({ devices });
    }
    return isSuccess;
  };
}

SettingsWrapper.propTypes = {
  onComposeContactSupportEmail: PropTypes.func,
  onGetDevices: PropTypes.func,
  onRemoveDevice: PropTypes.func
};

export default SettingsWrapper;
