import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';
import './restorebackupprogresspopup.scss';

const { header, cancelLabel } = string.popups.restore_backup_progress;

const RestoreBackupProgressPopup = props => (
  <div id="restore-backup-progress-popup" className="popup-content">
    <div className="popup-title">
      <h1>{header}</h1>
    </div>
    <div className="progress">
      <div className="bar">
        <div
          className={`content ${defineBarClass(props.hasError)}`}
          style={{ width: props.backupPercent + '%' }}
        />
      </div>
      <div className="percent">
        <div className="content">
          <span className="number">{props.backupPercent}%</span>
        </div>
      </div>
    </div>
    <button className="button-c" onClick={props.onClickCancelRestoreBackup}>
      <span>{cancelLabel}</span>
    </button>
  </div>
);

const defineBarClass = hasError =>
  hasError ? 'stop-animation' : 'running-animation';

RestoreBackupProgressPopup.propTypes = {
  backupPercent: PropTypes.number,
  hasError: PropTypes.bool,
  onClickCancelRestoreBackup: PropTypes.func
};

export default RestoreBackupProgressPopup;
