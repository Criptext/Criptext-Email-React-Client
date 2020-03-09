import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Settings from './Settings';
import { myAccount, mySettings } from '../utils/electronInterface';
import { sendRemoveDeviceErrorMessage } from '../utils/electronEventInterface';
import string from '../lang';

class SettingsWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sectionSelected: string.settings.account,
      devices: [],
      recoveryEmail: myAccount.recoveryEmail,
      recoveryEmailConfirmed: !!myAccount.recoveryEmailConfirmed,
      twoFactorAuth: undefined,
      readReceiptsEnabled: undefined,
      replyToEmail: undefined,
      isHiddenSettingsPopup: true
    };
  }

  render() {
    return (
      <Settings
        {...this.props}
        activeAccount={myAccount.email}
        devices={this.state.devices}
        isFromStore={mySettings.isFromStore}
        isHiddenSettingsPopup={this.state.isHiddenSettingsPopup}
        onClickCheckForUpdates={this.props.onCheckForUpdates}
        onClickLogout={this.handleClickLogout}
        onClickSection={this.handleClickSection}
        onClosePopup={this.handleClosePopup}
        onConfirmLogout={this.handleConfirmLogout}
        onRemoveDevice={this.handleRemoveDevice}
        recoveryEmail={this.state.recoveryEmail}
        recoveryEmailConfirmed={this.state.recoveryEmailConfirmed}
        sectionSelected={this.state.sectionSelected}
        twoFactorAuth={this.state.twoFactorAuth}
        readReceiptsEnabled={this.state.readReceiptsEnabled}
        replyToEmail={this.state.replyToEmail}
      />
    );
  }

  async componentDidMount() {
    const {
      devices,
      recoveryEmail,
      twoFactorAuth,
      recoveryEmailConfirmed,
      readReceiptsEnabled,
      replyToEmail
    } = await this.props.onGetUserSettings();
    this.setState({
      devices,
      recoveryEmail,
      recoveryEmailConfirmed,
      twoFactorAuth,
      readReceiptsEnabled,
      replyToEmail
    });
  }

  handleClickSection = section => {
    this.setState({ sectionSelected: section });
  };

  handleClosePopup = () => {
    this.setState({
      isHiddenSettingsPopup: true
    });
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

  handleClickLogout = () => {
    this.setState({
      isHiddenSettingsPopup: false
    });
  };

  handleConfirmLogout = async () => {
    const isSuccess = await this.props.onLogout();
    this.setState({
      isHiddenSettingsPopup: true
    });
    if (isSuccess) {
      await this.props.onDeleteDeviceData();
    } else {
      sendRemoveDeviceErrorMessage();
    }
  };
}

SettingsWrapper.propTypes = {
  onCheckForUpdates: PropTypes.func,
  onDeleteDeviceData: PropTypes.func,
  onGetUserSettings: PropTypes.func,
  onLogout: PropTypes.func,
  onRemoveDevice: PropTypes.func
};

export default SettingsWrapper;
