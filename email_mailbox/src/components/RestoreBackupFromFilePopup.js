import React from 'react';
import PropTypes from 'prop-types';
import { BackupTypes } from './RestoreBackupPopupWrapper';
import string from '../lang';
import './restorebackupfromfilepopup.scss';

const {
  title,
  paragraphs,
  input,
  buttons
} = string.popups.restore_backup_from_file;
const { backed_up, size } = paragraphs;
const { label, placeholder } = input;
const { restore, cancel } = buttons;

const RestoreBackupFromFilePopup = props => {
  return (
    <div id="restore-backup-from-file" className="popup-content">
      <div className="popup-title">
        <h1>{title}</h1>
      </div>
      <div className="popup-paragraph file-details">
        <p>{`${backed_up}: ${props.backupDate}`}</p>
        <p>{`     ${size}: ${props.backupSize}`}</p>
      </div>
      {props.backupFileType === BackupTypes.ENCRYPTED && (
        <div className="popup-paragraph">
          <p>{label}</p>
        </div>
      )}
      {props.backupFileType === BackupTypes.ENCRYPTED && (
        <div className="popup-inputs">
          <div className="popup-input">
            <input
              type={props.inputType}
              value={props.passphrase}
              placeholder={placeholder}
              onChange={props.onChangeInputPassphrase}
            />
            <i
              className={
                props.inputType === 'password' ? 'icon-not-show' : 'icon-show'
              }
              onClick={() => props.onChangeInputTypePassphrase()}
            />
          </div>
        </div>
      )}
      <div className="popup-buttons">
        <button
          className="button-a popup-confirm-button"
          onClick={props.onRestoreBackupFromFile}
        >
          <span>{restore}</span>
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

RestoreBackupFromFilePopup.propTypes = {
  backupDate: PropTypes.string,
  backupSize: PropTypes.string,
  backupFileType: PropTypes.string,
  inputType: PropTypes.string,
  onChangeInputPassphrase: PropTypes.func,
  onChangeInputTypePassphrase: PropTypes.func,
  onConfirmRestoreBackup: PropTypes.func,
  onDismissRestoreBackup: PropTypes.func,
  onRestoreBackupFromFile: PropTypes.func,
  passphrase: PropTypes.string
};

export default RestoreBackupFromFilePopup;
