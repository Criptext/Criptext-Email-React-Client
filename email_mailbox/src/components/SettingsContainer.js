import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Settings from './../containers/Settings';
import CustomDomains from './CustomDomains';
import AliasesWrapper from './AliasesWrapper';
import SettingsHOC from './SettingsHOC';
import { myAccount } from '../utils/electronInterface';
import { sendRemoveDeviceErrorMessage } from '../utils/electronEventInterface';
import { getAlias, updateAlias, activateAddress } from '../utils/ipc';
import { appDomain } from '../utils/const';

const Setting = SettingsHOC(Settings);
const Domains = SettingsHOC(CustomDomains);
const Alias = SettingsHOC(AliasesWrapper);

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
      aliasesByDomain: {},
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
            onChangePanel={this.handleChangePanel}
            onAddAlias={this.handleAddAlias}
          />
        );
      default:
        return (
          <Setting
            {...this.props}
            titlePath={myAccount.email}
            devices={this.state.devices}
            aliasesByDomain={this.state.aliasesByDomain}
            isHiddenSettingsPopup={this.state.isHiddenSettingsPopup}
            onChangeAliasStatus={this.handleChangeAliasStatus}
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
    const res = await this.props.onGetUserSettings();
    const {
      aliases,
      devices,
      recoveryEmail,
      twoFactorAuth,
      recoveryEmailConfirmed,
      readReceiptsEnabled,
      replyToEmail
    } = res;

    const myAliases = await getAlias({});
    const rowIds = new Set();
    const aliasesByDomain = [...myAliases, ...aliases].reduce(
      (result, alias) => {
        if (rowIds.has(alias.rowId)) return result;
        const aliasDomain = alias.domain || appDomain;
        if (!result[aliasDomain]) result[aliasDomain] = [];
        result[aliasDomain].push(alias);
        rowIds.add(alias.rowId);
        return result;
      },
      {}
    );

    this.setState({
      aliasesByDomain,
      devices,
      recoveryEmail,
      recoveryEmailConfirmed,
      twoFactorAuth,
      readReceiptsEnabled,
      replyToEmail
    });
  }

  handleAddAlias = alias => {
    const aliasDomain = alias.domain || appDomain;
    const aliasesByDomain = { ...this.state.aliasesByDomain };
    if (!aliasesByDomain[aliasDomain]) aliasesByDomain[aliasDomain] = [];
    aliasesByDomain[aliasDomain].push(alias);
    this.setState({
      aliasesByDomain
    });
  };

  handleChangeAliasStatus = async (rowId, domain, active) => {
    console.log('ROW ID ' , rowId, domain, active);
    const aliasDomain = domain || appDomain;
    const aliasesByDomain = { ...this.state.aliasesByDomain };
    if (!aliasesByDomain[aliasDomain]) aliasesByDomain[aliasDomain] = [];
    const index = aliasesByDomain[aliasDomain].findIndex(
      alias => alias.rowId === rowId
    );
    aliasesByDomain[aliasDomain][index].active = active;
    this.setState({
      aliasesByDomain
    }, async () => {
      const result = await activateAddress({
        rowId,
        active
      });
      console.log(result);
      if (result && result.status === 200) {
        console.log('RESULT');
        await updateAlias({
          rowId,
          active
        });
      } else {
        console.log('FAILURE');
        aliasesByDomain[aliasDomain][index].active = !active;
        this.setState({
          aliasesByDomain
        })
      }
    });
  };

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
