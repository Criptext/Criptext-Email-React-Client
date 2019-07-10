import React, { Component } from 'react';
import SettingsAccountBackup from './SettingsAccountBackup';

class SettingsAccountBackupWrapper extends Component {
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
        {...this.props}
        backupPercent={this.state.backupPercent}
        inProgress={this.state.inProgress}
        progressMessage={this.state.progressMessage}
      />
    );
  }
}

export default SettingsAccountBackupWrapper;
