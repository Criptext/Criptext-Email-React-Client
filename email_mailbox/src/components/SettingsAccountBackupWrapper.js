import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SettingsAccountBackup from './SettingsAccountBackup';
import { showSaveFileDialog, mySettings } from './../utils/electronInterface';
import {
  exportBackupUnencrypted,
  getDefaultBackupFolder,
  exportBackupEncrypted,
  updateSettings
} from '../utils/ipc';
import { addEvent, removeEvent, Event } from '../utils/electronEventInterface';
import string from './../lang';
import {
  defineBackupFileName,
  formatLastBackupDate,
  getAutoBackupDates
} from '../utils/TimeUtils';
import { convertToHumanSize } from '../utils/StringUtils';

const { export_backup } = string.notification;
const { auto, progress } = string.settings.mailbox_backup;
const { backing_up_mailbox, backup_mailbox_success } = progress;
const { daily, weekly, monthly } = auto.options.frequencyLabels;
const frequencies = [
  { text: daily, value: 'daily' },
  { text: weekly, value: 'weekly' },
  { text: monthly, value: 'monthly' }
];

const EXPORT_TYPES = {
  UNENCRYPT: 'unencrypted',
  ENCRYPT: 'encrypted',
  NONE: 'none'
};

const defineBackupFullpath = async extension => {
  const defautlPath = await getDefaultBackupFolder();
  const filename = defineBackupFileName(extension);
  return `${defautlPath}/${filename}`;
};

const defineUnitToAppend = frequency => {
  switch (frequency) {
    case 'daily':
      return 'days';
    case 'weekly':
      return 'weeks';
    case 'monthly':
      return 'months';
    default:
      return 'days';
  }
};

const removeFilenameFromPath = path => {
  const parts = path.split('/');
  parts.pop();
  return parts.join('/');
};

class SettingsAccountBackupWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      autoBackupEnable: !!mySettings.autoBackupEnable,
      backupPath: '',
      backupPercent: 0,
      backupType: '',
      exportType: EXPORT_TYPES.NONE,
      inProgress: false,
      progressMessage: '',
      selectedFrequency: mySettings.autoBackupFrequency || 'daily'
    };
  }

  render() {
    const lastDate = formatLastBackupDate(mySettings.autoBackupLastDate);
    const lastSize = convertToHumanSize(mySettings.autoBackupLastSize, true, 0);
    return (
      <SettingsAccountBackup
        {...this.props}
        autoBackupEnable={this.state.autoBackupEnable}
        backupPercent={this.state.backupPercent}
        frequencies={frequencies}
        inProgress={this.state.inProgress}
        lastDate={lastDate}
        lastSize={lastSize}
        onChangeSelectBackupFrequency={this.handleChangeSelectBackupFrequency}
        onChangeSwitchSelectBackupFolder={
          this.handleChangeSwitchSelectBackupFolder
        }
        onClickBackupNow={this.handleClickBackupNow}
        onClickChangeAutoBackupPath={this.handleClickChangeAutoBackupPath}
        progressMessage={this.state.progressMessage}
        selectedFrequency={this.state.selectedFrequency}
      />
    );
  }

  componentDidUpdate() {
    if (
      !this.state.inProgress &&
      this.props.mailboxBackupParams.showSelectPathDialog
    ) {
      const { type, password } = this.props.mailboxBackupParams;
      if (type === 'manual') {
        this.handleManualBackup({ password });
      } else if (type === 'auto') {
        this.handleAutoBackup();
      }
    }
  }

  componentWillUnmount() {
    this.removeEventHandlers();
  }

  handleManualBackup = ({ password }) => {
    this.setState(
      {
        inProgress: true,
        backupPercent: 5,
        progressMessage: backing_up_mailbox,
        backupType: 'manual',
        exportType: password ? EXPORT_TYPES.ENCRYPT : EXPORT_TYPES.UNENCRYPT
      },
      async () => {
        const extension = password ? 'enc' : 'db';
        const backupPath = await defineBackupFullpath(extension);
        showSaveFileDialog(backupPath, selectedPath => {
          if (!selectedPath) {
            this.props.onClearMailboxBackupParams();
            return this.clearProgressParams();
          }
          this.setState(
            {
              backupPath: selectedPath,
              password
            },
            this.initMailboxBackup
          );
        });
      }
    );
  };

  handleAutoBackup = dialogFolderPath => {
    this.setState(
      {
        inProgress: true,
        backupPercent: 0,
        progressMessage: backing_up_mailbox,
        backupType: 'auto',
        exportType: EXPORT_TYPES.UNENCRYPT
      },
      async () => {
        const backupPath =
          dialogFolderPath || (await defineBackupFullpath('db'));
        showSaveFileDialog(backupPath, selectedPath => {
          if (!selectedPath) {
            this.props.onClearMailboxBackupParams();
            return this.clearProgressParams();
          }
          this.setState({ backupPath: selectedPath }, this.initMailboxBackup);
        });
      }
    );
  };

  handleChangeSwitchSelectBackupFolder = e => {
    const nextCheckedValue = e.target.checked;
    if (nextCheckedValue === true) {
      if (!mySettings.autoBackupPath) {
        this.props.onShowSelectBackupFolderPopup();
      } else {
        this.setState(
          {
            autoBackupEnable: nextCheckedValue
          },
          () => {
            const filename = defineBackupFileName('db');
            const backupPath = `${mySettings.autoBackupPath}/${filename}`;
            this.setState(
              {
                backupType: 'auto',
                backupPath,
                inProgress: true,
                backupPercent: 0,
                progressMessage: backing_up_mailbox
              },
              this.initMailboxBackup
            );
          }
        );
      }
    } else {
      this.setState(
        {
          autoBackupEnable: nextCheckedValue
        },
        async () => {
          await updateSettings({ autoBackupEnable: false });
        }
      );
    }
  };

  handleClickBackupNow = () => {
    const filename = defineBackupFileName('db');
    const backupPath = `${mySettings.autoBackupPath}/${filename}`;
    this.setState(
      {
        backupType: 'auto',
        backupPath,
        inProgress: true,
        backupPercent: 0,
        progressMessage: backing_up_mailbox
      },
      this.initMailboxBackup
    );
  };

  handleClickChangeAutoBackupPath = () => {
    const filename = defineBackupFileName('db');
    const prevAutoBackupPath = `${mySettings.autoBackupPath}/${filename}`;
    this.handleAutoBackup(prevAutoBackupPath);
  };

  handleChangeSelectBackupFrequency = e => {
    const selectedFrequency = e.target.value;
    const filename = defineBackupFileName('db');
    const backupPath = `${mySettings.autoBackupPath}/${filename}`;
    this.setState(
      {
        backupType: 'auto',
        backupPath,
        inProgress: true,
        backupPercent: 0,
        selectedFrequency,
        progressMessage: backing_up_mailbox
      },
      this.initMailboxBackup
    );
  };

  initMailboxBackup = () => {
    const { backupPath, password } = this.state;
    this.initMailboxBackupListeners();
    if (!password) {
      exportBackupUnencrypted({
        backupPath,
        notificationParams: export_backup
      });
    } else {
      exportBackupEncrypted({
        backupPath,
        password,
        notificationParams: export_backup
      });
    }
  };

  clearProgressParams = () => {
    this.setState({
      backupPercent: 0,
      inProgress: false,
      progressMessage: '',
      backupType: '',
      exportType: EXPORT_TYPES.NONE,
      backupPath: ''
    });
  };

  initMailboxBackupListeners = () => {
    addEvent(
      Event.LOCAL_BACKUP_ENABLE_EVENTS,
      this.localBackupEnableEventsCallback
    );
    addEvent(
      Event.LOCAL_BACKUP_EXPORT_FINISHED,
      this.localBackupExportFinishedCallback
    );
    addEvent(
      Event.LOCAL_BACKUP_ENCRYPT_FINISHED,
      this.localBackupEncryptFinishedCallback
    );
    addEvent(Event.LOCAL_BACKUP_SUCCESS, this.localBackupSuccessCallback);
  };

  removeEventHandlers = () => {
    removeEvent(
      Event.LOCAL_BACKUP_ENABLE_EVENTS,
      this.localBackupEnableEventsCallback
    );
    removeEvent(
      Event.LOCAL_BACKUP_EXPORT_FINISHED,
      this.localBackupExportFinishedCallback
    );
    removeEvent(
      Event.LOCAL_BACKUP_ENCRYPT_FINISHED,
      this.localBackupEncryptFinishedCallback
    );
    removeEvent(Event.LOCAL_BACKUP_SUCCESS, this.localBackupSuccessCallback);
  };

  localBackupEnableEventsCallback = () => {
    const isExportUnencrypted =
      this.state.exportType === EXPORT_TYPES.UNENCRYPT;
    const backupPercent = isExportUnencrypted ? 40 : 30;
    this.setState({ backupPercent });
  };

  localBackupExportFinishedCallback = () => {
    const isExportUnencrypted =
      this.state.exportType === EXPORT_TYPES.UNENCRYPT;
    const backupPercent = isExportUnencrypted ? 70 : 60;
    this.setState({ backupPercent });
  };

  localBackupEncryptFinishedCallback = () => {
    this.setState({ backupPercent: 80 });
  };

  localBackupSuccessCallback = () => {
    this.setState({ backupPercent: 99.9 }, () => {
      setTimeout(() => {
        const backupPercent = 100;
        const progressMessage = backup_mailbox_success;
        this.setState({ backupPercent, progressMessage }, () => {
          this.props.onClearMailboxBackupParams();
          this.removeEventHandlers();
          if (this.state.backupType === 'auto') {
            this.setState(
              {
                autoBackupEnable: true
              },
              this.updateAutoBackupParams
            );
          }
          setTimeout(this.clearProgressParams, 3000);
        });
      }, 2000);
    });
  };

  updateAutoBackupParams = async () => {
    const { selectedFrequency, backupPath } = this.state;
    const timeUnit = defineUnitToAppend(selectedFrequency);
    const { nowDate, nextDate } = getAutoBackupDates(Date.now(), 1, timeUnit);
    const autoBackupPath = removeFilenameFromPath(backupPath);
    await updateSettings({
      autoBackupEnable: true,
      autoBackupFrequency: selectedFrequency,
      autoBackupLastDate: nowDate,
      autoBackupLastSize: 9999,
      autoBackupNextDate: nextDate,
      autoBackupPath
    });
  };
}

SettingsAccountBackupWrapper.propTypes = {
  mailboxBackupParams: PropTypes.object,
  onClearMailboxBackupParams: PropTypes.func,
  onShowSelectBackupFolderPopup: PropTypes.func
};

export default SettingsAccountBackupWrapper;
