import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Settings from './Settings';
import { mySettings } from '../utils/electronInterface';
import string from '../lang';

class SettingsWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sectionSelected: string.settings.account
    };
  }

  render() {
    return (
      <Settings
        {...this.props}
        sectionSelected={this.state.sectionSelected}
        isFromStore={mySettings.isFromStore}
        onClickCheckForUpdates={this.props.onCheckForUpdates}
        onClickSection={this.handleClickSection}
      />
    );
  }

  handleClickSection = section => {
    this.setState({ sectionSelected: section });
  };
}

SettingsWrapper.propTypes = {
  onCheckForUpdates: PropTypes.func,
  onLogout: PropTypes.func,
  onRemoveDevice: PropTypes.func
};

export default SettingsWrapper;
