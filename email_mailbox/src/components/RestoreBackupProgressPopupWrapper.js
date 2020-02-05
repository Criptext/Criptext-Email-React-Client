import React, { Component } from 'react';
import PropTypes from 'prop-types';
import RestoreBackupProgressPopup from './RestoreBackupProgressPopup';
import {
  addEvent,
  removeEvent,
  Event,
  sendRefreshMailboxSync
} from '../utils/electronEventInterface';
import { restoreBackupEncrypted, restoreBackupUnencrypted } from '../utils/ipc';

class RestoreBackupProgressPopupWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      backupPercent: 0,
      hasError: false
    };
  }

  render() {
    return (
      <RestoreBackupProgressPopup
        {...this.props}
        backupPercent={this.state.backupPercent}
        hasError={this.state.hasError}
      />
    );
  }

  componentDidMount() {
    this.initRestoreBackupListeners();
    const { backupPath, password } = this.props;
    if (password) {
      restoreBackupEncrypted({ backupPath, password });
    } else {
      restoreBackupUnencrypted({ backupPath });
    }
  }

  componentWillUnmount() {
    this.removeRestoreBackupListeners();
  }

  initRestoreBackupListeners = () => {
    addEvent(
      Event.RESTORE_BACKUP_DISABLE_EVENTS,
      this.restoreBackupDisableEventsCallback
    );
    addEvent(
      Event.RESTORE_BACKUP_ENABLE_EVENTS,
      this.restoreBackupEnableEventsCallback
    );
    addEvent(Event.RESTORE_BACKUP_FINISHED, this.restoreBackupFinishedCallback);
    addEvent(Event.RESTORE_BACKUP_SUCCESS, this.restoreBackupSuccessCallback);
  };

  removeRestoreBackupListeners = () => {
    removeEvent(
      Event.RESTORE_BACKUP_DISABLE_EVENTS,
      this.restoreBackupDisableEventsCallback
    );
    removeEvent(
      Event.RESTORE_BACKUP_ENABLE_EVENTS,
      this.restoreBackupEnableEventsCallback
    );
    removeEvent(
      Event.RESTORE_BACKUP_FINISHED,
      this.restoreBackupFinishedCallback
    );
    removeEvent(
      Event.RESTORE_BACKUP_SUCCESS,
      this.restoreBackupSuccessCallback
    );
  };

  restoreBackupDisableEventsCallback = () => {
    this.setState({
      backupPercent: 20
    });
  };

  restoreBackupEnableEventsCallback = error => {
    const backupPercent = error ? 0 : 40;
    const hasError = !!error;
    this.setState(
      {
        backupPercent,
        hasError
      },
      () => {
        if (hasError) {
          setTimeout(this.props.onInvalidBackupFile, 1600);
        }
      }
    );
  };

  restoreBackupFinishedCallback = () => {
    this.setState({
      backupPercent: 80
    });
  };

  restoreBackupSuccessCallback = () => {
    this.setState(
      {
        backupPercent: 100
      },
      () => {
        setTimeout(() => {
          sendRefreshMailboxSync();
          this.props.onDismissRestoreBackup();
        }, 1500);
      }
    );
  };
}

RestoreBackupProgressPopupWrapper.propTypes = {
  backupPath: PropTypes.string,
  onCloseMailboxPopup: PropTypes.func,
  onDismissRestoreBackup: PropTypes.func,
  onInvalidBackupFile: PropTypes.func,
  password: PropTypes.string,
  sectionSelected: PropTypes.object
};

export default RestoreBackupProgressPopupWrapper;
