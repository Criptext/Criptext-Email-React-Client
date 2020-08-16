import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SetupCover from './SetupCover';
import './backupwrapper.scss';
import { getDefaultBackupFolder, createDefaultBackupFolder, updateAccount, swapMailboxAccount, closeLoginWindow } from '../../utils/ipc';
import { getAutoBackupDates } from '../../utils/TimeUtils';
import string from '../../lang';

const { backup } = string.setup;

class BackupWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      theme: false
    };
  }

  render() {
    return (
      <SetupCover
        {...this.props}
        title={backup.title}
        topButton={backup.button}
        bottomButton={string.setup.skip}
        onClickTopButton={this.handleActivateBackup}
      >
        <div className="setup-backup">
          <div>
            {backup.message}
          </div>
        </div>
      </SetupCover>
    );
  }

  handleActivateBackup = async () => {
    await createDefaultBackupFolder();
    const backupPath = await getDefaultBackupFolder();

    const frequency = 'daily';
    const timeUnit = 'days';
    const { nextDate } = getAutoBackupDates(Date.now(), 1, timeUnit);

    await updateAccount({
      recipientId: this.props.account.username,
      autoBackupEnable: true,
      autoBackupFrequency: frequency,
      autoBackupNextDate: nextDate,
      autoBackupPath: backupPath
    });

    swapMailboxAccount({ 
      accountId: this.props.account.id,
      recipientId: this.props.account.username  
    });
    closeLoginWindow();
  }
}

BackupWrapper.propTypes = {
  step: PropTypes.string
};
export default BackupWrapper;
