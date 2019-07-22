import React from 'react';
import string from '../lang';
import './creatingbackupfilepopup.scss';

const { title, paragraph } = string.popups.creating_backup_file;

const CreatingBackupFilePopup = () => {
  return (
    <div id="creating-backup-file-popup" className="popup-content">
      <div className="popup-title">
        <h1>{title}</h1>
      </div>
      <div className="popup-paragraph">
        <div className="loading-ring creating-backup-file-popup-loading">
          <div />
          <div />
          <div />
          <div />
        </div>
        <p>{paragraph}</p>
      </div>
    </div>
  );
};

export default CreatingBackupFilePopup;
