import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SettingsAccountBackup from './SettingsAccountBackup';
import string from './../lang';
import { exportBackupFile } from '../utils/ipc';

const { auto: autoBackup } = string.settings.mailbox_backup;
const { backing_up_mailbox } = autoBackup;

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
      !this.state.inProgress &&
      !prevProps.mailboxBackupParams.displayProgressBar &&
      this.props.mailboxBackupParams.displayProgressBar
    ) {
      this.setState(
        {
          inProgress: true,
          backupPercent: 5,
          progressMessage: backing_up_mailbox
        },
        () => {
          const { filePath, password } = this.props.mailboxBackupParams;
          this.initMailboxBackup({ filePath, password });
        }
      );
    }
  }

  initMailboxBackup = async ({ filePath, password }) => {
    try {
      await exportBackupFile({
        customPath: filePath,
        password
      });
      this.setState({
        inProgress: false,
        backupPercent: 0,
        progressMessage: ''
      });
    } catch (e) {
      return e;
    }
  };
}

SettingsAccountBackupWrapper.propTypes = {
  mailboxBackupParams: PropTypes.object
};

export default SettingsAccountBackupWrapper;
