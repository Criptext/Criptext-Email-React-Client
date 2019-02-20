import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Settings from './Settings';
import { myAccount } from '../utils/electronInterface';
import { SETTINGS_POPUP_TYPES } from './SettingGeneralWrapper';
import { sendRemoveDeviceErrorMessage } from '../utils/electronEventInterface';

class SettingsWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sectionSelected: 'general',
      devices: [],
      recoveryEmail: myAccount.recoveryEmail,
      recoveryEmailConfirmed: !!myAccount.recoveryEmailConfirmed,
      twoFactorAuth: undefined,
      readReceiptsEnabled: undefined,
      replyToEmail: undefined,
      isHiddenSettingsPopup: true,
      settingsPopupType: SETTINGS_POPUP_TYPES.NONE
    };
  }

  render() {
    return (
      <Settings
        {...this.props}
        devices={this.state.devices}
        onClickCheckForUpdates={this.props.onCheckForUpdates}
        onClickSection={this.handleClickSection}
        onRemoveDevice={this.handleRemoveDevice}
        recoveryEmail={this.state.recoveryEmail}
        recoveryEmailConfirmed={this.state.recoveryEmailConfirmed}
        sectionSelected={this.state.sectionSelected}
        twoFactorAuth={this.state.twoFactorAuth}
        readReceiptsEnabled={this.state.readReceiptsEnabled}
        replyToEmail={this.state.replyToEmail}
        onClickLogout={this.handleClickLogout}
        onConfirmLogout={this.handleConfirmLogout}
        onClickCancelLogout={this.handleClickCancelLogout}
        isHiddenSettingsPopup={this.state.isHiddenSettingsPopup}
        settingsPopupType={this.state.settingsPopupType}
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
      isHiddenSettingsPopup: false,
      settingsPopupType: SETTINGS_POPUP_TYPES.LOGOUT
    });
  };

  handleConfirmLogout = async () => {
    const isSuccess = await this.props.onLogout();
    if (isSuccess) {
      this.setState({
        isHiddenSettingsPopup: true,
        settingsPopupType: SETTINGS_POPUP_TYPES.NONE
      });
      await this.props.onDeleteDeviceData();
    } else {
      sendRemoveDeviceErrorMessage();
    }
  };

  handleClickCancelLogout = () => {
    this.setState({
      isHiddenSettingsPopup: true,
      settingsPopupType: SETTINGS_POPUP_TYPES.NONE
    });
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
