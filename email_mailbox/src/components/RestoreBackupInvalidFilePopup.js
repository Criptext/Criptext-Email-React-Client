import React from 'react';
import PropTypes from 'prop-types';
import string from '../lang';
import './restorebackupinvalidfilepopup.scss';

const {
  title,
  paragraph,
  button,
  cancel
} = string.popups.restore_backup_invalid_file;

const RestoreBackupInvalidFilePopup = props => {
  return (
    <div id="restore-backup-invalid-file" className="popup-content">
      <div className="popup-title">
        <h1>{title}</h1>
      </div>
      <div className="popup-paragraph">
        <p>{paragraph}</p>
      </div>
      <div className="popup-buttons">
        <input
          id="change-backup-file-input"
          type="file"
          onChange={props.onSelectBackupFile}
          multiple={false}
        />
        <label htmlFor="change-backup-file-input">
          <button
            className="button-a popup-confirm-button"
            onClick={() => {
              document.getElementById('change-backup-file-input').click();
            }}
            autoFocus
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

RestoreBackupInvalidFilePopup.propTypes = {
  onConfirmRestoreBackup: PropTypes.func,
  onDismissRestoreBackup: PropTypes.func,
  onSelectBackupFile: PropTypes.func
};

export default RestoreBackupInvalidFilePopup;
