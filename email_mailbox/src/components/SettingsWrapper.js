import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Settings from './Settings';
import { myAccount } from '../utils/electronInterface';

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
        onClickSection={this.handleClickSection}
        onClickContactSupport={this.props.onComposeContactSupportEmail}
        sectionSelected={this.state.sectionSelected}
        devices={this.state.devices}
      />
    );
  }

  async componentDidMount() {
    const trustedDevices = await this.props.onGetDevices();
    let devices;
    if (trustedDevices.length) {
      devices = trustedDevices
        .map(device => {
          return {
            name: device.deviceFriendlyName,
            type: device.deviceType,
            deviceId: device.deviceId,
            lastConnection: {
              place: null,
              time: null
            },
            isCurrentDevice: device.deviceId === myAccount.deviceId
          };
        })
        .sort(device => !device.isCurrentDevice);
      this.setState({ devices });
    }
  }

  handleClickSection = section => {
    this.setState({ sectionSelected: section });
  };
}

SettingsWrapper.propTypes = {
  onComposeContactSupportEmail: PropTypes.func,
  onGetDevices: PropTypes.func
};

export default SettingsWrapper;
