import React, { Component } from 'react';
import PropTypes from 'prop-types';
import RestoreBackupRequest from './RestoreBackupRequest';
import {
  setCanceledSyncStatus,
  showOpenBackupFileDialog
} from './../utils/electronInterface';

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
      mode: RestoreBackupModes.REQUEST
    };
  }

  render() {
    switch (this.state.mode) {
      case RestoreBackupModes.REQUEST: {
        return (
          <RestoreBackupRequest
            onConfirmRestoreBackup={this.handleConfirmRestoreBackup}
            onDismissRestoreBackup={this.handleDismissRestoreBackup}
          />
        );
      }
      default:
        return null;
    }
  }

  handleConfirmRestoreBackup = () => {
    const allowedExtensions = Object.values(BackupTypes);
    showOpenBackupFileDialog(allowedExtensions, paths => {
      if (!paths || !paths.length) return;
      const backupType = paths[0].split('.').pop();
      const nextMode =
        backupType === BackupTypes.ENCRYPTED
          ? RestoreBackupModes.ENCRYPTED_FILE
          : RestoreBackupModes.UNENCRYPTED_FILE;
      this.setState({ mode: nextMode });
    });
  };

  handleDismissRestoreBackup = () => {
    setCanceledSyncStatus(false);
    this.props.onCloseMailboxPopup();
  };
}

RestoreBackupPopupWrapper.propTypes = {
  onCloseMailboxPopup: PropTypes.func
};

export default RestoreBackupPopupWrapper;
