import React, { Component } from 'react';
import PropTypes from 'prop-types';
import RestoreBackupFromFilePopup from './RestoreBackupFromFilePopup';
import RestoreBackupInvalidFilePopup from './RestoreBackupInvalidFilePopup';
import RestoreBackupProgressPopupWrapper from './RestoreBackupProgressPopupWrapper';
import RestoreBackupRequestPopup from './RestoreBackupRequestPopup';
import { setPendingRestoreStatus } from './../utils/electronInterface';
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
  UNENCRYPTED: 'db',
  OLD_UNENCRYPTED: 'gz'
};

class RestoreBackupPopupWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      backupFileInfo: {
        type: null,
        date: null,
        size: 0,
        path: '',
        password: ''
      },
      mode: RestoreBackupModes.REQUEST,
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
            backupPath={this.state.backupFileInfo.path}
            onClickCancelRestoreBackup={this.handleClickCancelRestoreBackup}
            onDismissRestoreBackup={this.handleDismissRestoreBackup}
            onInvalidBackupFile={this.handleInvalidBackupFile}
            password={this.state.backupFileInfo.password}
            sectionSelected={this.props.sectionSelected}
          />
        );
      }
      case RestoreBackupModes.ENCRYPTED_FILE:
      case RestoreBackupModes.UNENCRYPTED_FILE: {
        const backupDate = formatLastBackupDate(this.state.backupFileInfo.date);
        const backupSize = convertToHumanSize(
          this.state.backupFileInfo.size,
          true,
          0
        );
        return (
          <RestoreBackupFromFilePopup
            backupDate={backupDate}
            backupFileType={this.state.backupFileInfo.type}
            backupSize={backupSize}
            inputType={this.state.inputType}
            onChangeInputPassphrase={this.handleChangeInputPassphrase}
            onChangeInputTypePassphrase={this.handleChangeInputTypePassphrase}
            onDismissRestoreBackup={this.handleDismissRestoreBackup}
            onRestoreBackupFromFile={this.handleRestoreBackupFromFile}
            password={this.state.backupFileInfo.password}
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
    if (!Object.values(BackupTypes).includes(fileType)) {
      return this.handleInvalidBackupFile();
    }
    const isEncryptedBackup = fileType === BackupTypes.ENCRYPTED;
    this.setState(state => ({
      mode: isEncryptedBackup
        ? RestoreBackupModes.ENCRYPTED_FILE
        : RestoreBackupModes.UNENCRYPTED_FILE,
      backupFileInfo: {
        ...state.backupFileInfo,
        ...this.getFileProperties(file),
        type: isEncryptedBackup
          ? BackupTypes.ENCRYPTED
          : BackupTypes.UNENCRYPTED,
        password: ''
      }
    }));
  };

  getFileProperties = file => ({
    date: file.lastModified,
    size: file.size,
    path: file.path
  });

  handleChangeInputPassphrase = ev => {
    const value = ev.target.value;
    this.setState(state => ({
      ...state,
      backupFileInfo: {
        ...state.backupFileInfo,
        password: value
      }
    }));
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
    setPendingRestoreStatus(false);
    this.props.onCloseMailboxPopup();
  };

  handleClickCancelRestoreBackup = () => {
    this.handleDismissRestoreBackup();
  };

  handleInvalidBackupFile = () => {
    this.setState({
      mode: RestoreBackupModes.INVALID_FILE
    });
  };
}

RestoreBackupPopupWrapper.propTypes = {
  onCloseMailboxPopup: PropTypes.func,
  sectionSelected: PropTypes.object
};

export { RestoreBackupPopupWrapper as default, BackupTypes };
