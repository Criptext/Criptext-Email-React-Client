import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SettingsAccountBackup from './SettingsAccountBackup';
import { showSaveFileDialog } from './../utils/electronInterface';
import string from './../lang';
import { exportBackupFile, getDefaultBackupFolder } from '../utils/ipc';

const { progress } = string.settings.mailbox_backup;
const { backing_up_mailbox, backup_mailbox_success } = progress;

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

  async componentDidUpdate() {
    if (!this.state.inProgress && this.props.mailboxBackupParams.inProgress) {
      const { password } = this.props.mailboxBackupParams;
      const defautlPath = await getDefaultBackupFolder();
      const filename = password ? 'backup.enc' : 'backup.db';
      const backupPath = `${defautlPath}/${filename}`;
      showSaveFileDialog(backupPath, selectedPath => {
        if (!selectedPath) {
          this.props.onClearMailboxBackupParams();
          return this.clearProgressParams();
        }

        this.setState(
          {
            inProgress: true,
            backupPercent: 1,
            progressMessage: backing_up_mailbox
          },
          () => {
            this.initMailboxBackup({
              backupPath: selectedPath,
              password
            });
          }
        );
      });
    }
  }

  initMailboxBackup = ({ backupPath, password }) => {
    if (!password) return this.handleUnencryptedBackup({ backupPath });

    return this.handleEncryptedBackup({ backupPath, password });
  };

  handleUnencryptedBackup = ({ backupPath }) => {
    this.setState(
      {
        backupPercent: 70
      },
      async () => {
        await exportBackupFile({
          customPath: backupPath
        });
        this.setState(
          {
            backupPercent: 100,
            progressMessage: backup_mailbox_success
          },
          () => {
            this.props.onClearMailboxBackupParams();
            setTimeout(this.clearProgressParams, 1500);
          }
        );
      }
    );
  };

  handleEncryptedBackup = ({ backupPath, password }) => {
    alert(backupPath, password);
    this.props.onClearMailboxBackupParams();
  };

  clearProgressParams = () => {
    this.setState({
      inProgress: false,
      backupPercent: 0,
      progressMessage: ''
    });
  };
}

SettingsAccountBackupWrapper.propTypes = {
  mailboxBackupParams: PropTypes.object,
  onClearMailboxBackupParams: PropTypes.func
};

export default SettingsAccountBackupWrapper;
