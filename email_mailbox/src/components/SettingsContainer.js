import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Settings from './../containers/Settings';
import CustomDomains from './CustomDomains';
import Aliases from './Aliases';
import SettingsHOC from './SettingsHOC';
import { myAccount } from '../utils/electronInterface';
import { sendRemoveDeviceErrorMessage } from '../utils/electronEventInterface';

const Setting = SettingsHOC(Settings);
const Domains = SettingsHOC(CustomDomains);
const Alias = SettingsHOC(Aliases);

const PANEL = {
  SETTINGS: 'settings',
  DOMAIN: 'custom-domains',
  ALIAS: 'alias'
};

class SettingsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      panel: PANEL.SETTINGS,
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
    switch (this.state.panel) {
      case PANEL.DOMAIN:
        return (
          <Domains
            isHiddenSettingsPopup={this.state.isHiddenSettingsPopup}
            titlePath={PANEL.DOMAIN}
          />
        );
      case PANEL.ALIAS:
        return (
          <Alias
            isHiddenSettingsPopup={this.state.isHiddenSettingsPopup}
            titlePath={PANEL.ALIAS}
          />
        );
      default:
        return (
          <Setting
            {...this.props}
            titlePath={myAccount.email}
            devices={this.state.devices}
            isHiddenSettingsPopup={this.state.isHiddenSettingsPopup}
            onChangePanel={this.handleChangePanel}
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

  handleChangePanel = panel => {
    this.setState({
      panel
    });
  };

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

SettingsContainer.propTypes = {
  onCheckForUpdates: PropTypes.func,
  onDeleteDeviceData: PropTypes.func,
  onGetUserSettings: PropTypes.func,
  onLogout: PropTypes.func,
  onRemoveDevice: PropTypes.func
};

export default SettingsContainer;
