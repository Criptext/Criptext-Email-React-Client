import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';
import './restorebackupprogresspopup.scss';

const { header, cancelLabel } = string.popups.restore_backup_progress;

const ManualSyncDeviceApprovedPopup = props => (
  <div id="restore-backup-progress-popup" className="popup-content">
    <div className="popup-title">
      <h1>{header}</h1>
    </div>
    <div className="progress">
      <div className="bar">
        <div
          className={`content running-animation`}
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

ManualSyncDeviceApprovedPopup.propTypes = {
  backupPercent: PropTypes.number,
  onClickCancelRestoreBackup: PropTypes.func
};

export default ManualSyncDeviceApprovedPopup;
