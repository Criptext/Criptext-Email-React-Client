import React from 'react';
import string from '../lang';
import { sendRestoreBackupInitEvent } from '../utils/electronEventInterface';

const { label, button, description } = string.settings.restore_backup;

const SettingsAccountRestoreBackup = () => (
  <div id="settings-account-backup" className="cptx-section-item">
    <span className="cptx-section-item-title">{label}</span>
    <span className="cptx-section-item-description">{description}</span>
    <div className="cptx-section-item-control">
      <button className="button-b" onClick={() => sendRestoreBackupInitEvent()}>
        {button}
      </button>
    </div>
  </div>
);

export default SettingsAccountRestoreBackup;
