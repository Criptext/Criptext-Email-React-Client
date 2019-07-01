import React from 'react';
import string from './../lang';
import './settingsaccountbackup.scss';

const { manual: manualBackup } = string.settings.mailbox_backup;

const SettingsAccountBackup = () => (
  <div id="settings-account-backup" className="cptx-section-item">
    <div className="local-backup-manual">
      <span className="cptx-section-item-title">{manualBackup.label}</span>
      <div className="cptx-section-item-control">
        <button className="button-b">{manualBackup.button}</button>
      </div>
    </div>
  </div>
);

export default SettingsAccountBackup;
