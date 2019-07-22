import React from 'react';
import PropTypes from 'prop-types';
import string from '../lang';
import './restorebackuprequest.scss';

const {
  title,
  paragraph,
  button,
  cancel
} = string.popups.restore_backup_request;

const RestoreBackupRequest = props => {
  return (
    <div id="restore-backup-request" className="popup-content">
      <div className="popup-title">
        <h1>{title}</h1>
      </div>
      <div className="popup-paragraph">
        <p>{paragraph}</p>
      </div>
      <div className="popup-buttons">
        <button
          className="button-a popup-confirm-button"
          onClick={props.onConfirmRestoreBackup}
        >
          <span>{button}</span>
        </button>
        <button
          className="button-c popup-cancel-button"
          onClick={props.onDismissRestoreBackup}
        >
          <span>{cancel}</span>
        </button>
      </div>
    </div>
  );
};

RestoreBackupRequest.propTypes = {
  onConfirmRestoreBackup: PropTypes.func,
  onDismissRestoreBackup: PropTypes.func
};

export default RestoreBackupRequest;
