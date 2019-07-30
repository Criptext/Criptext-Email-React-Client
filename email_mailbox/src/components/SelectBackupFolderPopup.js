import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';

const { title, note, buttons } = string.popups.select_backup_folder;

const SelectBackupFolderPopup = props => {
  return (
    <div id="select-backup-folder-popup" className="popup-content">
      <div className="popup-title">
        <h1>{title}</h1>
      </div>
      <div className="popup-paragraph unencrypt-note">
        <p>
          <b>{note.header}</b> {note.content}
        </p>
      </div>
      <div className="popup-buttons">
        <button
          className="button-a popup-cancel-button"
          onClick={() => props.onTogglePopup()}
        >
          {buttons.cancel}
        </button>
        <button
          className="button-a popup-confirm-button"
          onClick={() => props.onSelectBackupFolder()}
        >
          {buttons.select}
        </button>
      </div>
    </div>
  );
};

SelectBackupFolderPopup.propTypes = {
  onSelectBackupFolder: PropTypes.func,
  onTogglePopup: PropTypes.func
};

export default SelectBackupFolderPopup;
