import React, { Component } from 'react';
import SettingsAccountBackup from './SettingsAccountBackup';

class SettingsGeneralLanguageWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inProgress: false,
      backupPercent: 0,
      progressMessage: ''
    };
  }

  render() {
    return (
      <SettingsAccountBackup
        backupPercent={this.state.backupPercent}
        inProgress={this.state.inProgress}
        progressMessage={this.state.progressMessage}
      />
    );
  }
}

export default SettingsGeneralLanguageWrapper;
