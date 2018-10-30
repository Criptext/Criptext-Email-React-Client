import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Settings from './Settings';
import { myAccount } from '../utils/electronInterface';

class SettingsWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sectionSelected: 'general',
      devices: [],
      recoveryEmail: myAccount.recoveryEmail,
      recoveryEmailConfirmed: !!myAccount.recoveryEmailConfirmed,
      twoFactorAuth: undefined
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
        recoveryEmail={this.state.recoveryEmail}
        recoveryEmailConfirmed={this.state.recoveryEmailConfirmed}
        sectionSelected={this.state.sectionSelected}
        twoFactorAuth={this.state.twoFactorAuth}
      />
    );
  }

  async componentDidMount() {
    const {
      devices,
      recoveryEmail,
      twoFactorAuth,
      recoveryEmailConfirmed
    } = await this.props.onGetUserSettings();
    this.setState({
      devices,
      recoveryEmail,
      recoveryEmailConfirmed,
      twoFactorAuth
    });
  }

  handleClickSection = section => {
    this.setState({ sectionSelected: section });
  };

  handleRemoveDevice = async ({ deviceId, password }) => {
    const isSuccess = await this.props.onRemoveDevice({ deviceId, password });
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
  onGetUserSettings: PropTypes.func,
  onRemoveDevice: PropTypes.func
};

export default SettingsWrapper;
