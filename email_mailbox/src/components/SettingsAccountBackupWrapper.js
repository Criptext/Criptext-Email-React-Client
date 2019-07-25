import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SettingsAccountBackup from './SettingsAccountBackup';
import { showSaveFileDialog } from './../utils/electronInterface';
import {
  exportBackupUnencrypted,
  getDefaultBackupFolder,
  exportBackupEncrypted
} from '../utils/ipc';
import { addEvent, removeEvent, Event } from '../utils/electronEventInterface';
import string from './../lang';
import { defineBackupFileName } from '../utils/TimeUtils';

const { export_backup } = string.notification;
const { progress } = string.settings.mailbox_backup;
const { backing_up_mailbox, backup_mailbox_success } = progress;

const BACKUP_TYPES = {
  UNENCRYPT: 'unencrypted',
  ENCRYPT: 'encrypted',
  NONE: 'none'
};

class SettingsAccountBackupWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      backupPercent: 0,
      inProgress: false,
      progressMessage: '',
      type: BACKUP_TYPES.NONE
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

  componentDidUpdate() {
    if (!this.state.inProgress && this.props.mailboxBackupParams.inProgress) {
      const { password } = this.props.mailboxBackupParams;
      this.setState(
        {
          inProgress: true,
          backupPercent: 5,
          progressMessage: backing_up_mailbox,
          type: password ? BACKUP_TYPES.ENCRYPT : BACKUP_TYPES.UNENCRYPT
        },
        async () => {
          const defautlPath = await getDefaultBackupFolder();
          const extension = password ? 'enc' : 'db';
          const filename = defineBackupFileName(extension);
          const backupPath = `${defautlPath}/${filename}`;
          showSaveFileDialog(backupPath, selectedPath => {
            if (!selectedPath) {
              this.props.onClearMailboxBackupParams();
              return this.clearProgressParams();
            }
            this.initMailboxBackup({
              backupPath: selectedPath,
              password,
              notificationParams: export_backup
            });
          });
        }
      );
    }
  }

  componentWillUnmount() {
    this.removeEventHandlers();
  }

  initMailboxBackup = ({ backupPath, password, notificationParams }) => {
    this.initMailboxBackupListeners();
    if (!password) {
      exportBackupUnencrypted({ backupPath, notificationParams });
    } else {
      exportBackupEncrypted({ backupPath, password, notificationParams });
    }
  };

  clearProgressParams = () => {
    this.setState({
      backupPercent: 0,
      inProgress: false,
      progressMessage: '',
      transition: 0,
      type: BACKUP_TYPES.NONE
    });
  };

  initMailboxBackupListeners = () => {
    addEvent(
      Event.LOCAL_BACKUP_ENABLE_EVENTS,
      this.localBackupEnableEventsCallback
    );
    addEvent(
      Event.LOCAL_BACKUP_EXPORT_FINISHED,
      this.localBackupExportFinishedCallback
    );
    addEvent(
      Event.LOCAL_BACKUP_ENCRYPT_FINISHED,
      this.localBackupEncryptFinishedCallback
    );
    addEvent(Event.LOCAL_BACKUP_SUCCESS, this.localBackupSuccessCallback);
  };

  removeEventHandlers = () => {
    removeEvent(
      Event.LOCAL_BACKUP_ENABLE_EVENTS,
      this.localBackupEnableEventsCallback
    );
    removeEvent(
      Event.LOCAL_BACKUP_EXPORT_FINISHED,
      this.localBackupExportFinishedCallback
    );
    removeEvent(
      Event.LOCAL_BACKUP_ENCRYPT_FINISHED,
      this.localBackupEncryptFinishedCallback
    );
    removeEvent(Event.LOCAL_BACKUP_SUCCESS, this.localBackupSuccessCallback);
  };

  localBackupEnableEventsCallback = () => {
    const isOnlyExport = this.state.type === BACKUP_TYPES.UNENCRYPT;
    const backupPercent = isOnlyExport ? 40 : 30;
    this.setState({ backupPercent });
  };

  localBackupExportFinishedCallback = () => {
    const isOnlyExport = this.state.type === BACKUP_TYPES.UNENCRYPT;
    const backupPercent = isOnlyExport ? 70 : 60;
    this.setState({ backupPercent });
  };

  localBackupEncryptFinishedCallback = () => {
    this.setState({ backupPercent: 80 });
  };

  localBackupSuccessCallback = () => {
    this.setState({ backupPercent: 99.9 }, () => {
      setTimeout(() => {
        const backupPercent = 100;
        const progressMessage = backup_mailbox_success;
        this.setState({ backupPercent, progressMessage }, () => {
          this.props.onClearMailboxBackupParams();
          this.removeEventHandlers();
          setTimeout(this.clearProgressParams, 3000);
        });
      }, 2000);
    });
  };
}

SettingsAccountBackupWrapper.propTypes = {
  mailboxBackupParams: PropTypes.object,
  onClearMailboxBackupParams: PropTypes.func
};

export default SettingsAccountBackupWrapper;
