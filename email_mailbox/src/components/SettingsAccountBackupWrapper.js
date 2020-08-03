import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SettingsAccountBackup from './SettingsAccountBackup';
import {
  showSaveFileDialog,
  myAccount,
  getBackupStatus
} from './../utils/electronInterface';
import {
  exportBackupUnencrypted,
  getDefaultBackupFolder,
  exportBackupEncrypted,
  updateAccount,
  initAutoBackupMonitor,
  disableAutoBackup
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

const backupStatus = {
  DISABLE_EVENTS: 1,
  ENABLE_EVENTS: 2,
  BACKUP_FINISHED: 3
};

const definePercentageByStatus = status => {
  switch (status) {
    case backupStatus.DISABLE_EVENTS:
      return 25;
    case backupStatus.ENABLE_EVENTS:
      return 50;
    case backupStatus.BACKUP_FINISHED:
      return 75;
    default:
      return 0;
  }
};

const removeFilenameFromPath = path => {
  const lastSepIndex =
    path.lastIndexOf('/') > -1 ? path.lastIndexOf('/') : path.lastIndexOf(`\\`);
  return path.substr(0, lastSepIndex);
};

class SettingsAccountBackupWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      autoBackupEnable: !!myAccount.autoBackupEnable,
      backupPath: '',
      backupPercent: 0,
      backupType: '',
      exportType: EXPORT_TYPES.NONE,
      inProgress: false,
      progressMessage: '',
      selectedFrequency: myAccount.autoBackupFrequency || 'daily'
    };
  }

  render() {
    const lastDate = myAccount.autoBackupLastDate
      ? formatLastBackupDate(myAccount.autoBackupLastDate)
      : null;
    const lastSize = myAccount.autoBackupLastSize
      ? convertToHumanSize(myAccount.autoBackupLastSize, true, 0)
      : null;
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

  componentDidMount() {
    const currentBackupStatus = getBackupStatus();
    if (currentBackupStatus) {
      const backupPercent = definePercentageByStatus(currentBackupStatus);
      this.setState(
        {
          inProgress: true,
          backupPercent,
          progressMessage: backing_up_mailbox
        },
        this.initMailboxBackupListeners
      );
    }
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
        const res = await showSaveFileDialog(backupPath);
        const selectedPath = res.filePath;
        if (!selectedPath) {
          this.props.onClearMailboxBackupParams();
          return this.clearProgressParams();
        }
        this.setState(
          {
            backupPath: selectedPath,
            password
          },
          () => {
            this.initMailboxBackup(false);
          }
        );
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
        const res = await showSaveFileDialog(backupPath);
        const selectedPath = res.filePath;
        if (!selectedPath) {
          this.props.onClearMailboxBackupParams();
          return this.clearProgressParams();
        }
        this.setState({ backupPath: selectedPath }, this.initMailboxBackup);
      }
    );
  };

  handleChangeSwitchSelectBackupFolder = e => {
    const nextCheckedValue = e.target.checked;
    if (nextCheckedValue === true) {
      if (!myAccount.autoBackupPath) {
        this.props.onShowSelectBackupFolderPopup();
      } else {
        this.setState(
          {
            autoBackupEnable: nextCheckedValue
          },
          () => {
            const filename = defineBackupFileName('db');
            const backupPath = `${myAccount.autoBackupPath}/${filename}`;
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
          await updateAccount({ autoBackupEnable: false });
          await disableAutoBackup(myAccount.id);
        }
      );
    }
  };

  handleClickBackupNow = () => {
    const filename = defineBackupFileName('db');
    const backupPath = `${myAccount.autoBackupPath}/${filename}`;
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
    const prevAutoBackupPath = `${myAccount.autoBackupPath}/${filename}`;
    this.handleAutoBackup(prevAutoBackupPath);
  };

  handleChangeSelectBackupFrequency = e => {
    const selectedFrequency = e.target.value;
    const filename = defineBackupFileName('db');
    const backupPath = `${myAccount.autoBackupPath}/${filename}`;
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

  initMailboxBackup = isAutoBackup => {
    const { backupPath, password } = this.state;
    this.initMailboxBackupListeners();
    if (!password) {
      exportBackupUnencrypted({
        backupPath,
        notificationParams: export_backup,
        isAutoBackup: isAutoBackup !== undefined ? isAutoBackup : true
      });
    } else {
      exportBackupEncrypted({
        backupPath,
        password,
        notificationParams: export_backup,
        accountObj: {
          recipientId: myAccount.recipientId,
          name: myAccount.name
        }
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
    addEvent(Event.LOCAL_BACKUP_STARTED, this.localBackupStartedCallback);
    addEvent(Event.BACKUP_PROGRESS, this.localBackupProgressCallback);
    addEvent(Event.LOCAL_BACKUP_SUCCESS, this.localBackupSuccessCallback);
  };

  removeEventHandlers = () => {
    removeEvent(Event.LOCAL_BACKUP_STARTED, this.localBackupStartedCallback);
    removeEvent(Event.BACKUP_PROGRESS, this.localBackupProgressCallback);
    removeEvent(Event.LOCAL_BACKUP_SUCCESS, this.localBackupSuccessCallback);
  };

  localBackupStartedCallback = account => {
    if (account.email !== myAccount.email) return;
    const isExportUnencrypted =
      this.state.exportType === EXPORT_TYPES.UNENCRYPT;
    const backupPercent = isExportUnencrypted ? 40 : 30;
    this.setState({ backupPercent });
  };

  localBackupProgressCallback = data => {
    if (data.email !== myAccount.email) return;
    this.setState({ backupPercent: data.progress });
  };

  localBackupSuccessCallback = ({
    backupSize,
    isAutoBackup,
    accountData,
    backupInBackground
  }) => {
    if (accountData.email !== myAccount.email) return;
    this.setState({ backupPercent: 99.9 }, () => {
      setTimeout(() => {
        const backupPercent = 100;
        const progressMessage = backup_mailbox_success;
        this.setState({ backupPercent, progressMessage }, () => {
          if (isAutoBackup && !backupInBackground) {
            this.updateAutoBackupParams(backupSize);
          }

          this.props.onClearMailboxBackupParams();
          this.removeEventHandlers();
          if (this.state.backupType === 'auto') {
            this.setState({
              autoBackupEnable: true
            });
          }
          setTimeout(this.clearProgressParams, 3000);
        });
      }, 2000);
    });
  };

  updateAutoBackupParams = async backupSize => {
    const { selectedFrequency, backupPath } = this.state;
    const timeUnit = defineUnitToAppend(selectedFrequency);
    const { nowDate, nextDate } = getAutoBackupDates(Date.now(), 1, timeUnit);
    const autoBackupPath = removeFilenameFromPath(backupPath);
    await updateAccount({
      autoBackupEnable: true,
      autoBackupFrequency: selectedFrequency,
      autoBackupLastDate: nowDate,
      autoBackupLastSize: backupSize,
      autoBackupNextDate: nextDate,
      autoBackupPath
    });
    initAutoBackupMonitor();
  };
}

SettingsAccountBackupWrapper.propTypes = {
  mailboxBackupParams: PropTypes.object,
  onClearMailboxBackupParams: PropTypes.func,
  onShowSelectBackupFolderPopup: PropTypes.func
};

export default SettingsAccountBackupWrapper;
