import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';
import './settingsaccountbackup.scss';

const { manual: manualBackup } = string.settings.mailbox_backup;

const SettingsAccountBackup = props => (
  <div id="settings-account-backup" className="cptx-section-item">
    <div className="local-backup-manual">
      <span className="cptx-section-item-title">{manualBackup.label}</span>
      <div className="cptx-section-item-control">
        <button
          className="button-b"
          onClick={() => props.onClickExportBackupFile()}
        >
          {manualBackup.button}
        </button>
      </div>
    </div>
    {props.inProgress && (
      <div className="cptx-backing-up-bar">
        <div className="bar-background">
          <div
            className="bar-progress"
            style={{ width: `${props.backupPercent}%` }}
          />
        </div>
        <span className="cptx-section-item-description bar-message">
          {props.progressMessage}
        </span>
      </div>
    )}
  </div>
);

SettingsAccountBackup.propTypes = {
  backupPercent: PropTypes.number,
  inProgress: PropTypes.bool,
  onClickExportBackupFile: PropTypes.func,
  progressMessage: PropTypes.string
};

export default SettingsAccountBackup;
