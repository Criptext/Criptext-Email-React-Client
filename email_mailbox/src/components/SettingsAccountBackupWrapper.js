import React, { Component } from 'react';
import PropTypes from 'prop-types';
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

  componentDidUpdate(prevProps) {
    if (
      this.state.inProgress === false &&
      this.state.inProgress !== prevProps.mailboxBackupParams.displayProgressBar
    ) {
      this.setState(
        {
          inProgress: true,
          backupPercent: 5,
          progressMessage: 'Backing up mailbox...'
        },
        () => {
          const { password } = prevProps.mailboxBackupParams;
          this.initMailboxBackup(password);
        }
      );
    }
  }

  initMailboxBackup = () => {
    setTimeout(() => {
      this.setState({
        inProgress: false,
        backupPercent: 0,
        progressMessage: ''
      });
    }, 5000);
  };
}

SettingsAccountBackupWrapper.propTypes = {
  mailboxBackupParams: PropTypes.object
};

export default SettingsAccountBackupWrapper;
