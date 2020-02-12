import React from 'react';
import PropTypes from 'prop-types';
import { Switch } from 'react-switch-input';
import string from './../lang';
import './settingsaccountbackup.scss';
import { myAccount } from '../utils/electronInterface';

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
        disabled={props.inProgress}
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
        checked={props.autoBackupEnable}
        disabled={props.inProgress}
      />
    </div>
    {props.autoBackupEnable && (
      <div className="ctpx-section-item-options">
        <div className="ctpx-item-option">
          <div className="item-option-label">
            <span className="cptx-section-item-title">
              {autoBackup.options.last_backup}
            </span>
          </div>
          <div className="item-option-content">
            <span className="cptx-section-item-description">
              {props.lastDate} ({props.lastSize})
            </span>
            <button
              className="button-b"
              onClick={() => props.onClickBackupNow()}
              disabled={props.inProgress}
            >
              <span>{autoBackup.options.backup_now}</span>
            </button>
          </div>
        </div>

        <div className="ctpx-item-option">
          <div className="item-option-label">
            <span className="cptx-section-item-title">
              {autoBackup.options.backup_folder}
            </span>
          </div>
          <div className="item-option-content ctpx-autobackup-path">
            <span className="cptx-section-item-description">
              {myAccount.autoBackupPath}
            </span>
          </div>
          <div
            className="cptx-section-item-title change-path-button"
            onClick={() => props.onClickChangeAutoBackupPath()}
            disabled={props.inProgress}
          >
            <i className="icon-dots" />
          </div>
        </div>

        <div className="ctpx-item-option">
          <div className="item-option-label">
            <span className="cptx-section-item-title">
              {autoBackup.options.frequency}
            </span>
          </div>
          <div className="item-option-content cptx-section-item-control">
            <select
              onChange={props.onChangeSelectBackupFrequency}
              value={props.selectedFrequency}
              disabled={props.inProgress}
            >
              {props.frequencies.map((freq, index) => (
                <option key={index} value={freq.value}>
                  {freq.text}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
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
  autoBackupEnable: PropTypes.bool,
  backupPercent: PropTypes.number,
  frequencies: PropTypes.array,
  inProgress: PropTypes.bool,
  lastDate: PropTypes.string,
  lastSize: PropTypes.string,
  onChangeSelectBackupFrequency: PropTypes.func,
  onChangeSwitchSelectBackupFolder: PropTypes.func,
  onClickBackupNow: PropTypes.func,
  onClickChangeAutoBackupPath: PropTypes.func,
  onClickExportBackupFile: PropTypes.func,
  progressMessage: PropTypes.string,
  selectedFrequency: PropTypes.string
};

export default SettingsAccountBackup;
