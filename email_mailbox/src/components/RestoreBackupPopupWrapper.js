import React, { Component } from 'react';
import PropTypes from 'prop-types';
import RestoreBackupFromFilePopup from './RestoreBackupFromFilePopup';
import RestoreBackupInvalidFilePopup from './RestoreBackupInvalidFilePopup';
import RestoreBackupProgressPopupWrapper from './RestoreBackupProgressPopupWrapper';
import RestoreBackupRequestPopup from './RestoreBackupRequestPopup';
import { setCanceledSyncStatus } from './../utils/electronInterface';
import { convertToHumanSize } from './../utils/StringUtils';
import { formatLastBackupDate } from './../utils/TimeUtils';

const RestoreBackupModes = {
  REQUEST: 'request',
  ENCRYPTED_FILE: 'encrypted',
  UNENCRYPTED_FILE: 'unencrypted',
  RESTORING: 'restoring',
  RETRY_RESTORE: 'retry',
  INVALID_FILE: 'invalid-file'
};

const BackupTypes = {
  ENCRYPTED: 'enc',
  UNENCRYPTED: 'db'
};

class RestoreBackupPopupWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      backupDate: null,
      backupFileType: null,
      backupSize: null,
      mode: RestoreBackupModes.REQUEST,
      passphrase: '',
      inputType: 'password'
    };
  }

  render() {
    switch (this.state.mode) {
      case RestoreBackupModes.REQUEST: {
        return (
          <RestoreBackupRequestPopup
            onSelectBackupFile={this.handleSelectBackupFile}
            onDismissRestoreBackup={this.handleDismissRestoreBackup}
          />
        );
      }
      case RestoreBackupModes.INVALID_FILE: {
        return (
          <RestoreBackupInvalidFilePopup
            onSelectBackupFile={this.handleSelectBackupFile}
            onDismissRestoreBackup={this.handleDismissRestoreBackup}
          />
        );
      }
      case RestoreBackupModes.RESTORING: {
        return (
          <RestoreBackupProgressPopupWrapper
            onClickCancelRestoreBackup={this.handleClickCancelRestoreBackup}
            passphrase={this.state.passphrase}
          />
        );
      }
      case RestoreBackupModes.ENCRYPTED_FILE:
      case RestoreBackupModes.UNENCRYPTED_FILE: {
        const backupDate = formatLastBackupDate(this.state.backupDate);
        const backupSize = convertToHumanSize(this.state.backupSize, true, 0);
        return (
          <RestoreBackupFromFilePopup
            backupDate={backupDate}
            backupFileType={this.state.backupFileType}
            backupSize={backupSize}
            inputType={this.state.inputType}
            onChangeInputPassphrase={this.handleChangeInputPassphrase}
            onChangeInputTypePassphrase={this.handleChangeInputTypePassphrase}
            onDismissRestoreBackup={this.handleDismissRestoreBackup}
            onRestoreBackupFromFile={this.handleRestoreBackupFromFile}
            passphrase={this.state.passphrase}
          />
        );
      }
      default:
        return null;
    }
  }

  handleSelectBackupFile = ev => {
    ev.preventDefault();
    const [file] = ev.target.files;
    const fileType = file.name.split('.').pop();
    let newState = {};
    switch (fileType) {
      case BackupTypes.ENCRYPTED:
        newState = {
          backupFileType: BackupTypes.ENCRYPTED,
          mode: RestoreBackupModes.ENCRYPTED_FILE,
          backupDate: file.lastModified,
          backupSize: file.size
        };
        break;
      case BackupTypes.UNENCRYPTED:
        newState = {
          backupFileType: BackupTypes.UNENCRYPTED,
          mode: RestoreBackupModes.UNENCRYPTED_FILE,
          backupDate: file.lastModified,
          backupSize: file.size
        };
        break;
      default:
        newState = {
          backupFileType: null,
          mode: RestoreBackupModes.INVALID_FILE,
          backupDate: null,
          backupSize: null
        };
        break;
    }
    this.setState(newState);
  };

  handleChangeInputPassphrase = ev => {
    const value = ev.target.value;
    this.setState({
      passphrase: value
    });
  };

  handleChangeInputTypePassphrase = () => {
    const prevValue = this.state.inputType;
    this.setState({
      inputType: prevValue === 'password' ? 'text' : 'password'
    });
  };

  handleRestoreBackupFromFile = () => {
    this.setState({
      mode: RestoreBackupModes.RESTORING
    });
  };

  handleDismissRestoreBackup = () => {
    setCanceledSyncStatus(false);
    this.props.onCloseMailboxPopup();
  };

  handleClickCancelRestoreBackup = () => {
    this.handleDismissRestoreBackup();
  };
}

RestoreBackupPopupWrapper.propTypes = {
  onCloseMailboxPopup: PropTypes.func
};

export { RestoreBackupPopupWrapper as default, BackupTypes };
