import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';
import './settingsaccountbackup.scss';

const { manual: manualBackup } = string.settings.mailbox_backup;

const SettingsAccountBackup = props => (
  <div id="settings-account-backup" className="cptx-section-item">
    <span className="cptx-section-item-title">{manualBackup.label}</span>
    <span className="cptx-section-item-description">
      {manualBackup.description}
    </span>
    <div className="cptx-section-item-control">
      <button
        className="button-b"
        onClick={() => props.onClickExportBackupFile()}
      >
        <span>{manualBackup.button}</span>
      </button>
    </div>
    {props.inProgress && (
      <div className="cptx-backing-up-bar">
        <div className="bar-background">
          <div
            className={`bar-progress ${defineProgressBarClass(
              props.backupPercent
            )}`}
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

const defineProgressBarClass = percentage => {
  return percentage === 100 ? 'bar-is-success' : 'bar-in-progress';
};

SettingsAccountBackup.propTypes = {
  backupPercent: PropTypes.number,
  inProgress: PropTypes.bool,
  onClickExportBackupFile: PropTypes.func,
  progressMessage: PropTypes.string
};

export default SettingsAccountBackup;
