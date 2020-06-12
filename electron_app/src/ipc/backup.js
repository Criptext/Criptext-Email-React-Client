const { ipcMain: ipc } = require('@criptext/electron-better-ipc');
const { shell } = require('electron');
const moment = require('moment');
const {
  createDefaultBackupFolder,
  getDefaultBackupFolder,
  prepareBackupFiles,
  exportBackupUnencrypted,
  exportBackupEncrypted,
  restoreUnencryptedBackup,
  restoreEncryptedBackup
} = require('./../BackupManager');
const globalManager = require('./../globalManager');
const { showNotification } = require('./../notificationManager');
const { sendEventToAllWindows } = require('./../windows/windowUtils');
const { send } = require('./../windows/mailbox');
const {
  defineBackupFileName,
  defineUnitToAppend,
  backupDateFormat
} = require('./../utils/TimeUtils');
const { APP_DOMAIN } = require('../utils/const');
const { updateAccount } = require('./../database');
const myAccount = require('../Account');
let autoBackupsTime = [];
let currentAutobackup = null;
let nextBackupTimer = null;

const simulatePause = ms => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

const commitBackupStatus = (eventName, status, params) => {
  sendEventToAllWindows(eventName, params);
  globalManager.backupStatus.set(status);
};

ipc.answerRenderer('create-default-backup-folder', () =>
  createDefaultBackupFolder()
);

const handleProgressCallback = (
  progress,
  message,
  userData,
  progressCallback
) => {
  if (!progressCallback) return;
  progressCallback({
    progress,
    message,
    ...userData
  });
};

const doExportBackupUnencrypted = async params => {
  const {
    backupPath,
    notificationParams,
    isAutoBackup = true,
    accountObj,
    progressCallback
  } = params;
  try {
    const [recipientId, domain] = accountObj
      ? accountObj.recipientId.split('@')
      : myAccount.recipientId.split('@');

    handleProgressCallback(
      -1,
      'starting_backup',
      {
        email: `${recipientId}@${domain || APP_DOMAIN}`,
        username: recipientId,
        domain: domain || APP_DOMAIN,
        name: accountObj ? accountObj.name : myAccount.name
      },
      progressCallback
    );

    commitBackupStatus('local-backup-disable-events', 1);
    prepareBackupFiles();
    commitBackupStatus('local-backup-enable-events', 2);

    const backupSize = await exportBackupUnencrypted({
      backupPath,
      accountObj,
      progressCallback
    });

    commitBackupStatus('local-backup-export-finished', 3, {
      backupSize,
      isAutoBackup
    });

    commitBackupStatus('local-backup-success', null);
    if (notificationParams) {
      showNotification({
        title: notificationParams.success.title,
        message: notificationParams.success.message,
        clickHandler: function() {
          shell.showItemInFolder(backupPath);
        },
        forceToShow: true
      });
    }
    return backupSize;
  } catch (error) {
    globalManager.windowsEvents.enable();
    commitBackupStatus('local-backup-enable-events', null, { error });
    commitBackupStatus('local-backup-failed', null, null);
    if (notificationParams) {
      showNotification({
        title: notificationParams.error.title,
        message: notificationParams.error.message,
        forceToShow: true
      });
    }
    return 0;
  }
};

ipc.answerRenderer('export-backup-unencrypted', doExportBackupUnencrypted);

ipc.answerRenderer('export-backup-encrypted', async params => {
  const { backupPath, password, notificationParams } = params;
  try {
    globalManager.windowsEvents.disable();
    commitBackupStatus('local-backup-disable-events', 1);
    prepareBackupFiles();
    await simulatePause(2000);
    globalManager.windowsEvents.enable();
    commitBackupStatus('local-backup-enable-events', 2);
    const backupSize = await exportBackupEncrypted({
      backupPath,
      password
    });
    commitBackupStatus('local-backup-export-finished', 3, {
      backupSize,
      isAutoBackup: false
    });
    await simulatePause(2000);
    commitBackupStatus('local-backup-success', null);
    await simulatePause(2000);
    if (notificationParams) {
      showNotification({
        title: notificationParams.success.title,
        message: notificationParams.success.message,
        clickHandler: function() {
          shell.showItemInFolder(backupPath);
        },
        forceToShow: true
      });
    }
    return backupSize;
  } catch (error) {
    globalManager.windowsEvents.enable();
    commitBackupStatus('local-backup-enable-events', null, { error });
    if (notificationParams) {
      showNotification({
        title: notificationParams.error.title,
        message: notificationParams.error.message,
        forceToShow: true
      });
    }
    return 0;
  }
});

ipc.answerRenderer('get-default-backup-folder', () => getDefaultBackupFolder());

ipc.answerRenderer('restore-backup-unencrypted', async ({ backupPath }) => {
  try {
    globalManager.windowsEvents.disable();
    commitBackupStatus('restore-backup-disable-events');
    prepareBackupFiles();
    await simulatePause(2000);
    globalManager.windowsEvents.enable();
    commitBackupStatus('restore-backup-enable-events');
    await restoreUnencryptedBackup({ filePath: backupPath });
    commitBackupStatus('restore-backup-finished');
    await simulatePause(2000);
    commitBackupStatus('restore-backup-success', null);
  } catch (error) {
    globalManager.windowsEvents.enable();
    commitBackupStatus('restore-backup-enable-events', null, {
      error: error.message
    });
  }
});

ipc.answerRenderer('restore-backup-encrypted', async params => {
  const { backupPath, password } = params;
  try {
    globalManager.windowsEvents.disable();
    commitBackupStatus('restore-backup-disable-events');
    prepareBackupFiles();
    await simulatePause(2000);
    globalManager.windowsEvents.enable();
    commitBackupStatus('restore-backup-enable-events');
    await restoreEncryptedBackup({ filePath: backupPath, password });
    commitBackupStatus('restore-backup-finished');
    await simulatePause(2000);
    commitBackupStatus('restore-backup-success', null);
  } catch (error) {
    globalManager.windowsEvents.enable();
    commitBackupStatus('restore-backup-enable-events', null, {
      error: error.message
    });
  }
});

const initAutoBackupMonitor = () => {
  autoBackupsTime = [];
  for (const account of myAccount.loggedAccounts) {
    const { autoBackupEnable, autoBackupNextDate } = account;

    if (
      !autoBackupEnable ||
      !autoBackupNextDate ||
      account.id === currentAutobackup
    )
      return;

    const now = moment();
    const pendingDate = moment(autoBackupNextDate);
    const timeDiff = pendingDate.diff(now);
    autoBackupsTime.push({
      username: account.recipientId,
      accountId: account.id,
      triggerTimer: timeDiff <= 0 ? 1 : timeDiff
    });
  }

  if (!currentAutobackup) checkNextBackup();
};

const checkNextBackup = () => {
  if (currentAutobackup || autoBackupsTime.length === 0) return;

  autoBackupsTime.sort((acc1, acc2) => {
    if (acc1.triggerTimer < acc2.triggerTimer) return -1;
    if (acc1.triggerTimer > acc2.triggerTimer) return 1;
    return 0;
  });

  if (nextBackupTimer) clearTimeout(nextBackupTimer);
  nextBackupTimer = setTimeout(() => {
    initAutoBackup(autoBackupsTime[0].accountId);
  }, autoBackupsTime[0].triggerTimer);
};

const initAutoBackup = async accountId => {
  autoBackupsTime = autoBackupsTime.filter(timer => {
    return timer.accountId !== accountId;
  });
  currentAutobackup = accountId;

  const account = myAccount.loggedAccounts.find(acc => acc.id === accountId);
  if (!account) {
    backupDone();
    return;
  }

  const {
    autoBackupEnable,
    autoBackupPath,
    autoBackupFrequency,
    autoBackupNextDate
  } = account;
  if (!autoBackupEnable || !autoBackupNextDate) {
    backupDone();
    return;
  }

  try {
    const backupFileName = defineBackupFileName('db');
    const backupSize = await doExportBackupUnencrypted({
      backupPath: `${autoBackupPath}/${backupFileName}`,
      progressCallback: data => {
        send('backup-progress', data);
      }
    });
    const timeUnit = defineUnitToAppend(autoBackupFrequency);
    const today = moment(Date.now());
    const nextDate = moment(autoBackupNextDate);
    do {
      nextDate.add(1, timeUnit);
    } while (nextDate.isBefore(today));
    await updateAccount({
      id: accountId,
      autoBackupLastDate: today.format(backupDateFormat),
      autoBackupLastSize: backupSize,
      autoBackupNextDate: nextDate.format(backupDateFormat)
    });
    const timeDiff = nextDate.diff(today);
    autoBackupsTime.push({
      username: account.recipientId,
      accountId,
      triggerTimer: timeDiff <= 0 ? 1 : timeDiff
    });

    backupDone();
  } catch (backupErr) {
    log(
      `Failed to do scheduled backup for account ${account.recipientId} : ${
        account.name
      }`
    );
    backupFail();
  }
};

const backupDone = () => {
  currentAutobackup = null;
  nextBackupTimer = null;
  checkNextBackup();
};

const backupFail = () => {
  currentAutobackup = null;
  nextBackupTimer = null;
  initAutoBackupMonitor();
};

ipc.answerRenderer('init-autobackup-monitor', () => {
  if (!currentAutobackup && nextBackupTimer) {
    clearTimeout(nextBackupTimer);
  }
  initAutoBackupMonitor();
});

ipc.answerRenderer('disable-auto-backup', accountId => {
  if (!currentAutobackup && nextBackupTimer) {
    clearTimeout(nextBackupTimer);
  }
  autoBackupsTime = autoBackupsTime.filter(timer => {
    return timer.accountId !== accountId;
  });

  if (!currentAutobackup) checkNextBackup();
});

const log = message => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[AutoBackup]: ${message}`);
  }
};

process.on('exit', () => {
  clearTimeout(nextBackupTimer);
  currentAutobackup = null;
  autoBackupsTime = [];
});

module.exports = {
  doExportBackupUnencrypted
};
