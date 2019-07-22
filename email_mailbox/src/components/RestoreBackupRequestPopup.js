import React from 'react';
import PropTypes from 'prop-types';
import string from '../lang';
import './restorebackuprequestpopup.scss';

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
        <input
          id="input-restore-backup"
          type="file"
          onChange={props.onSelectBackupFile}
          multiple={false}
        />
        <label htmlFor="input-restore-backup">
          <button
            className="button-a popup-confirm-button"
            onClick={() => {
              document.getElementById('input-restore-backup').click();
            }}
          >
            <span>{button}</span>
          </button>
        </label>

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
  onDismissRestoreBackup: PropTypes.func,
  onSelectBackupFile: PropTypes.func
};

export default RestoreBackupRequest;
