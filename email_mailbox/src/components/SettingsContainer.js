import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Settings from './../containers/Settings';
import CustomDomainsWrapper from './CustomDomainsWrapper';
import AliasesWrapper from './AliasesWrapper';
import SettingsHOC from './SettingsHOC';
import { myAccount } from '../utils/electronInterface';
import {
  sendRemoveDeviceErrorMessage,
  sendAliasSuccessStatusMessage,
  sendCustomDomainDeletedMessage,
  addEvent,
  removeEvent,
  Event
} from '../utils/electronEventInterface';
import { updateAlias, activateAddress, getCustomDomain } from '../utils/ipc';
import { appDomain } from '../utils/const';
import string from './../lang';
import AddressManager from './AddressManager';

const { sidebar, settings } = string;

const Setting = SettingsHOC(Settings);
const Domains = SettingsHOC(CustomDomainsWrapper);
const Alias = SettingsHOC(AliasesWrapper);
const Manager = SettingsHOC(AddressManager);

const PANEL = {
  SETTINGS: 'settings',
  DOMAIN: 'custom-domains',
  ALIAS: 'alias',
  MANAGER: 'address-manager'
};

class SettingsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      panel: PANEL.SETTINGS,
      devices: [],
      domains: [],
      aliasesByDomain: {},
      recoveryEmail: myAccount.recoveryEmail,
      recoveryEmailConfirmed: !!myAccount.recoveryEmailConfirmed,
      twoFactorAuth: undefined,
      readReceiptsEnabled: undefined,
      replyToEmail: undefined,
      isHiddenSettingsPopup: true,
      domainNotVerified: undefined,
      blockRemoteContent: undefined
    };
  }

  render() {
    switch (this.state.panel) {
      case PANEL.DOMAIN:
        return (
          <Domains
            isHiddenSettingsPopup={this.state.isHiddenSettingsPopup}
            titlePath={[
              sidebar.settings,
              settings.addresses,
              settings.custom_domains.title
            ]}
            domainNotVerified={this.state.domainNotVerified}
            onAddDomain={this.handleAddDomain}
            onUpdateCustomDomain={this.handleOnUpdateCustomDomain}
            onChangePanel={this.handleChangePanel}
          />
        );
      case PANEL.ALIAS:
        return (
          <Alias
            isHiddenSettingsPopup={this.state.isHiddenSettingsPopup}
            titlePath={[
              sidebar.settings,
              settings.addresses,
              settings.aliases.title
            ]}
            onChangePanel={this.handleChangePanel}
            onAddAlias={this.handleAddAlias}
          />
        );
      case PANEL.MANAGER:
        return (
          <Manager
            isHiddenSettingsPopup={this.state.isHiddenSettingsPopup}
            titlePath={[sidebar.settings, settings.addresses]}
            onChangePanel={this.handleChangePanel}
          />
        );
      default:
        return (
          <Setting
            {...this.props}
            titlePath={[myAccount.email]}
            devices={this.state.devices}
            aliasesByDomain={this.state.aliasesByDomain}
            domains={this.state.domains}
            isHiddenSettingsPopup={this.state.isHiddenSettingsPopup}
            onChangeAliasStatus={this.handleChangeAliasStatus}
            onChangePanel={this.handleChangePanel}
            onClickCheckForUpdates={this.props.onCheckForUpdates}
            onClickIsFromNotVerifiedOption={this.handleIsFromNotVerifiedOption}
            onClickLogout={this.handleClickLogout}
            onClosePopup={this.handleClosePopup}
            onConfirmLogout={this.handleConfirmLogout}
            onRemoveAlias={this.handleRemoveAlias}
            onRemoveCustomDomain={this.handleRemoveCustomDomain}
            onRemoveDevice={this.handleRemoveDevice}
            recoveryEmail={this.state.recoveryEmail}
            recoveryEmailConfirmed={this.state.recoveryEmailConfirmed}
            blockRemoteContent={this.state.blockRemoteContent}
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
      blockRemoteContent,
      devices,
      customDomains,
      recoveryEmail,
      twoFactorAuth,
      recoveryEmailConfirmed,
      readReceiptsEnabled,
      replyToEmail
    } = res;

    const rowIds = new Set();
    const aliasesByDomain = aliases.reduce((result, alias) => {
      if (rowIds.has(alias.rowId)) return result;
      const aliasDomain = alias.domain || appDomain;
      if (!result[aliasDomain]) result[aliasDomain] = [];
      result[aliasDomain].push(alias);
      rowIds.add(alias.rowId);
      return result;
    }, {});
    const domains = customDomains.map(domain => {
      return {
        name: domain.name,
        validated: domain.confirmed === 1
      };
    });

    this.setState({
      aliasesByDomain,
      blockRemoteContent,
      devices,
      recoveryEmail,
      recoveryEmailConfirmed,
      twoFactorAuth,
      readReceiptsEnabled,
      replyToEmail,
      domains
    });

    addEvent(Event.SETTINGS_OPENED, this.handleSetSettings);
  }

  componentWillMount() {
    removeEvent(Event.SETTINGS_OPENED, this.handleSetSettings);
  }

  handleAddDomain = domainObject => {
    const domainArray = this.state.domains;
    domainArray.push(domainObject);
    this.setState({
      domains: domainArray,
      domainNotVerified: undefined
    });
  };

  handleIsFromNotVerifiedOption = domainName => {
    this.setState({
      panel: PANEL.DOMAIN,
      domainNotVerified: domainName
    });
  };

  handleAddAlias = alias => {
    const aliasDomain = alias.domain || appDomain;
    const aliasesByDomain = { ...this.state.aliasesByDomain };
    if (!aliasesByDomain[aliasDomain]) aliasesByDomain[aliasDomain] = [];
    aliasesByDomain[aliasDomain].push(alias);
    this.setState({
      aliasesByDomain
    });
  };

  handleRemoveAlias = (addressId, email) => {
    const domain = email.split('@')[1];
    const aliasesByDomain = { ...this.state.aliasesByDomain };
    if (!aliasesByDomain[domain]) return;
    aliasesByDomain[domain] = aliasesByDomain[domain].filter(
      alias => alias.rowId !== addressId
    );
    if (aliasesByDomain[domain].length === 0) delete aliasesByDomain[domain];
    this.setState({
      aliasesByDomain
    });
  };

  handleOnUpdateCustomDomain = async () => {
    const domainsRaw = await getCustomDomain({});
    const domains = domainsRaw.map(domain => {
      return {
        name: domain.dataValues.name,
        validated: domain.dataValues.validated
      };
    });
    this.setState({
      domains
    });
  };

  handleRemoveCustomDomain = domainName => {
    const newDomains = this.state.domains.filter(e => e.name !== domainName);
    const aliasesByDomain = { ...this.state.aliasesByDomain };
    delete aliasesByDomain[domainName];
    this.setState({
      domains: newDomains,
      aliasesByDomain
    });
    sendCustomDomainDeletedMessage();
  };

  handleChangeAliasStatus = (rowId, domain, active) => {
    const aliasDomain = domain || appDomain;
    const aliasesByDomain = { ...this.state.aliasesByDomain };
    if (!aliasesByDomain[aliasDomain]) aliasesByDomain[aliasDomain] = [];
    const index = aliasesByDomain[aliasDomain].findIndex(
      alias => alias.rowId === rowId
    );
    aliasesByDomain[aliasDomain][index].active = active;
    this.setState(
      {
        aliasesByDomain
      },
      async () => {
        const result = await activateAddress({
          rowId,
          active
        });
        if (result && result.status === 200) {
          await updateAlias({
            rowId,
            active
          });
          sendAliasSuccessStatusMessage(active);
        } else {
          aliasesByDomain[aliasDomain][index].active = !active;
          this.setState({
            aliasesByDomain
          });
          sendAliasSuccessStatusMessage(!active);
        }
      }
    );
  };

  handleSetSettings = () => {
    this.setState({
      panel: PANEL.SETTINGS
    });
  };

  handleChangePanel = panel => {
    this.setState({
      panel
    });
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
