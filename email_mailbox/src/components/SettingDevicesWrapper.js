import React, { Component } from 'react';
import SettingDevices from './SettingDevices';
import { deviceTypes } from './../utils/const';

const currentDeviceName = 'Mac';

const devices = [
  {
    name: 'Mac',
    lastConnection: {
      place: 'Guayaquil',
      time: 'Now'
    },
    type: deviceTypes.PC,
    deviceId: 1
  },
  {
    name: 'Samsung Galaxy S8',
    lastConnection: {
      place: 'Guayaquil',
      time: '12 hours ago'
    },
    type: deviceTypes.PHONE,
    deviceId: 2
  },
  {
    name: 'Windows',
    lastConnection: {
      place: 'Guayaquil',
      time: 'Yesterday'
    },
    type: deviceTypes.PC,
    deviceId: 3
  }
];

class SettingDevicesWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      devices,
      currentDeviceName
    };
  }

  render() {
    return (
      <SettingDevices
        {...this.props}
        devices={this.state.devices}
        currentDeviceName={this.state.currentDeviceName}
        onClickRemoveDevice={this.handleClickRemoveDevice}
      />
    );
  }

  handleClickRemoveDevice = deviceId => {
    const devices = this.state.devices.filter(
      item => item.deviceId !== deviceId
    );
    this.setState({ devices });
  };
}

export default SettingDevicesWrapper;
