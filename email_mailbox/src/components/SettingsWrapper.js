import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Settings from './Settings';
import { mySettings, myAccount } from '../utils/electronInterface';
import { addEvent, removeEvent, Event } from '../utils/electronEventInterface';
import string from '../lang';

class SettingsWrapper extends Component {
  constructor(props) {
    super(props);
    const sectionSelected =
      props.sectionSelected &&
      props.sectionSelected.params &&
      props.sectionSelected.params.tabSelected
        ? props.sectionSelected.params.tabSelected
        : string.settings.account;
    const openRecoveryEmail =
      props.sectionSelected &&
      props.sectionSelected.params &&
      props.sectionSelected.params.openRecoveryEmail !== undefined
        ? props.sectionSelected.params.openRecoveryEmail
        : false;
    this.initEventHandlers();
    this.state = {
      sectionSelected,
      openRecoveryEmail
    };
  }

  render() {
    return (
      <Settings
        {...this.props}
        customerType={myAccount.customerType}
        sectionSelected={this.state.sectionSelected}
        openRecoveryEmail={this.state.openRecoveryEmail}
        isFromStore={mySettings.isFromStore}
        cleanOpenRecoveryEmail={this.cleanOpenRecoveryEmail}
        onClickCheckForUpdates={this.props.onCheckForUpdates}
        onClickSection={this.handleClickSection}
      />
    );
  }

  componentWillUnmount() {
    this.removeEventHandlers();
  }

  initEventHandlers = () => {
    addEvent(
      Event.REDIRECT_TO_OPEN_RECOVERY_EMAIL,
      this.handleEventOpenPopupRecoveryEmail
    );
  };

  removeEventHandlers = () => {
    removeEvent(
      Event.REDIRECT_TO_OPEN_RECOVERY_EMAIL,
      this.handleEventOpenPopupRecoveryEmail
    );
  };

  handleClickSection = section => {
    this.setState({ sectionSelected: section });
  };

  cleanOpenRecoveryEmail = () => {
    this.setState({ openRecoveryEmail: false });
  };

  handleEventOpenPopupRecoveryEmail = () => {
    this.setState({
      sectionSelected: string.settings.account,
      openRecoveryEmail: true
    });
  };
}

SettingsWrapper.propTypes = {
  onCheckForUpdates: PropTypes.func,
  onLogout: PropTypes.func,
  onRemoveDevice: PropTypes.func,
  sectionSelected: PropTypes.object
};

export default SettingsWrapper;
