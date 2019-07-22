import React, { Component } from 'react';
import PropTypes from 'prop-types';
import RestoreBackupRequest from './RestoreBackupRequest';
import { setCanceledSyncStatus } from './../utils/electronInterface';

const RestoreBackupModes = {
  REQUEST: 'request',
  ENCRYPTED_FILE: 'encrypted',
  UNENCRYPTED_FILE: 'unencrypted',
  RESTORING: 'restoring',
  RETRY_RESTORE: 'retry',
  INVALID_FILE: 'invalid-file'
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
    alert('Seleccionar archivo');
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
