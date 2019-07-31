import React from 'react';
import PropTypes from 'prop-types';
import { Switch } from 'react-switch-input';
import string from './../lang';
import './settingsaccountbackup.scss';

const {
  auto: autoBackup,
  manual: manualBackup
} = string.settings.mailbox_backup;

const SettingsAccountBackup = props => (
  <div id="settings-account-backup" className="cptx-section-item">
    <span className="cptx-section-item-title manual-backup">
      {manualBackup.label}
    </span>
    <div className="cptx-section-item-control manual-backup">
      <button
        className="button-b"
        onClick={() => props.onClickExportBackupFile()}
      >
        <span>{manualBackup.button}</span>
      </button>
    </div>

    <span className="cptx-section-item-title auto-backup">
      {autoBackup.label}
    </span>
    <span className="cptx-section-item-description auto-backup">
      {autoBackup.description}
    </span>
    <div className="cptx-section-item-control auto-backup">
      <Switch
        theme="two"
        name="setAutoBackupSwitch"
        onChange={props.onChangeSwitchSelectBackupFolder}
        checked={props.autoBackupEnabled}
      />
    </div>
    {props.autoBackupEnabled && (
      <table className="ctpx-section-item-options">
        <tr className="ctpx-item-option">
          <td className="item-option-label">
            <span className="cptx-section-item-title">
              {autoBackup.options.last_backup}
            </span>
          </td>
          <td>
            <span className="cptx-section-item-description">
              Today 10:21 AM (125 MB)
            </span>
            <button className="button-b">
              {autoBackup.options.backup_now}
            </button>
          </td>
        </tr>

        <tr className="ctpx-item-option">
          <td className="item-option-label">
            <span className="cptx-section-item-title">
              {autoBackup.options.backup_folder}
            </span>
          </td>
          <td className="backup-path-info">
            <span className="cptx-section-item-description backup-path">
              /home/julian/Documents/Criptext/julian@criptext.com/backups
            </span>
            <span className="cptx-section-item-title change-path-button">
              <i className="icon-dots" />
            </span>
          </td>
        </tr>

        <tr className="ctpx-item-option">
          <td className="item-option-label">
            <span className="cptx-section-item-title">
              {autoBackup.options.frequency}
            </span>
          </td>
          <td className="cptx-section-item-control">
            <select onChange={() => {}} value={props.selectedFrequency}>
              {props.frequencies.map((freq, index) => (
                <option key={index} value={freq.value}>
                  {freq.text}
                </option>
              ))}
            </select>
          </td>
        </tr>
      </table>
    )}

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
  autoBackupEnabled: PropTypes.bool,
  backupPercent: PropTypes.number,
  frequencies: PropTypes.array,
  inProgress: PropTypes.bool,
  onChangeSwitchSelectBackupFolder: PropTypes.func,
  onClickExportBackupFile: PropTypes.func,
  progressMessage: PropTypes.string,
  selectedFrequency: PropTypes.string
};

export default SettingsAccountBackup;
