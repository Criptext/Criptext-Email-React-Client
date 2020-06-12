import React, { Component } from 'react';
import Panel from './Panel';
import PropTypes from 'prop-types';
import randomcolor from 'randomcolor';
import {
  addEvent,
  removeEvent,
  Event,
  checkUserGuideSteps,
  sendMailboxEvent,
  sendBackupEnabledMessage
} from '../utils/electronEventInterface';
import {
  checkForUpdates,
  processPendingEvents,
  createDefaultBackupFolder,
  getDefaultBackupFolder,
  updateAccount,
  initAutoBackupMonitor
} from '../utils/ipc';
import {
  LabelType,
  getPendingRestoreStatus,
  mySettings,
  myAccount,
  showSaveFileDialog
} from '../utils/electronInterface';
import { SectionType, avatarBaseUrl } from '../utils/const';
import {
  addLabels,
  setAvatarUpdatedTimestamp,
  stopLoadSync,
  removeLabels,
  updateLabels
} from '../actions';
import { USER_GUIDE_STEPS } from './UserGuide';
import { TAB } from './Settings';
import { getAutoBackupDates, defineBackupFileName } from '../utils/TimeUtils';
import {
  setShownEnableBackupPopup,
  getShownEnableBackupPopup
} from '../utils/storage';

const MAILBOX_POPUP_TYPES = {
  ACCOUNT_DELETED: 'account-deleted',
  BIG_UPDATE_AVAILABLE: 'big-update-available',
  CREATING_BACKUP_FILE: 'creating-backup-file',
  CHANGE_ACCOUNT: 'change-account',
  DEVICE_REMOVED: 'device-removed',
  ENABLE_BACKUP: 'enable-backup',
  ONLY_BACKDROP: 'only-backdrop',
  PASSWORD_CHANGED: 'password-changed',
  RESTORE_BACKUP: 'restore-backup',
  SUSPENDED_ACCOUNT: 'suspended-account'
};

const RESTORE_BACKUP_POPUP_DELAY = 1000;
const THREADS_SIZE = 22;

class PanelWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isHiddenMailboxPopup: true,
      isOpenActivityPanel: false,
      isOpenSideBar: true,
      isOpenWelcome: true,
      mailboxPopupType: undefined,
      mailboxPopupData: undefined,
      backupSnackbar: undefined,
      sectionSelected: {
        type: SectionType.MAILBOX,
        params: {
          mailboxSelected: {
            id: 1,
            text: 'Inbox'
          },
          threadIdSelected: null,
          searchParams: {
            text: '',
            from: '',
            to: '',
            subject: '',
            hasAttachments: false
          }
        }
      }
    };
    this.initEventHandlers();
    processPendingEvents({});
  }

  render() {
    return (
      <Panel
        isHiddenMailboxPopup={this.state.isHiddenMailboxPopup}
        isOpenActivityPanel={this.state.isOpenActivityPanel}
        isOpenSideBar={this.state.isOpenSideBar}
        isOpenWelcome={this.state.isOpenWelcome}
        mailboxPopupType={this.state.mailboxPopupType}
        mailboxPopupData={this.state.mailboxPopupData}
        onClickCloseWelcome={this.handleCloseWelcome}
        onClickSection={this.handleClickSection}
        onClickThreadBack={this.handleClickThreadBack}
        onCloseMailboxPopup={this.handleCloseMailboxPopup}
        onToggleActivityPanel={this.handleToggleActivityPanel}
        onToggleSideBar={this.handleToggleSideBar}
        onUpdateApp={this.handleUpdateApp}
        sectionSelected={this.state.sectionSelected}
        onUpdateNow={this.handleUpdateNow}
        backupSnackbar={this.state.backupSnackbar}
        onDismissSnackbar={this.handleSnackbarDismiss}
        {...this.props}
      />
    );
  }

  componentDidMount() {
    const steps = [USER_GUIDE_STEPS.BUTTON_COMPOSE];
    checkUserGuideSteps(steps);
    this.handleCheckRestoreBackup();
  }

  handleUpdateNow = () => {
    checkForUpdates(true);
    this.handleCloseMailboxPopup();
  };

  componentDidUpdate(prevProps) {
    if (
      !prevProps.isLoadAppCompleted &&
      this.props.isLoadAppCompleted &&
      this.state.mailboxPopupType === MAILBOX_POPUP_TYPES.CHANGE_ACCOUNT
    ) {
      this.handleCloseMailboxPopup();
    }

    if (
      this.state.mailboxPopupType !== MAILBOX_POPUP_TYPES.ENABLE_BACKUP &&
      this.props.inboxCount > 10 &&
      !myAccount.autoBackupEnable &&
      !getShownEnableBackupPopup(myAccount.email)
    ) {
      this.handleShowEnableBackupPopup();
    }
  }

  handleClickSection = (type, params) => {
    switch (type) {
      case SectionType.MAILBOX:
        {
          const { mailboxSelected, searchParams } = params;
          const searchParamsChecked =
            searchParams || this.state.sectionSelected.params.searchParams;
          this.setState(state => ({
            ...state,
            sectionSelected: {
              type,
              params: {
                tabSelected: null,
                mailboxSelected,
                threadIdSelected: null,
                searchParams: searchParamsChecked
              }
            }
          }));
        }
        break;
      case SectionType.THREAD:
        {
          const { mailboxSelected, threadIdSelected, searchParams } = params;
          this.setState(state => ({
            ...state,
            sectionSelected: {
              type,
              params: {
                tabSelected: null,
                mailboxSelected,
                threadIdSelected,
                searchParams:
                  searchParams || this.state.sectionSelected.params.searchParams
              }
            }
          }));
        }
        break;
      case SectionType.SETTINGS:
        {
          const tabSelected = params && params.tab ? params.tab : TAB.ACCOUNT;
          const sectionSelected = {
            type,
            params: {
              mailboxSelected: null,
              threadIdSelected: null,
              tabSelected
            }
          };
          this.setState({ sectionSelected }, () => {
            sendMailboxEvent(Event.SETTINGS_OPENED);
          });
        }
        break;
      default:
        break;
    }
  };

  componentWillUnmount() {
    this.removeEventHandlers();
  }

  handleClickThreadBack = () => {
    this.setState({ threadIdSelected: null });
  };

  handleToggleActivityPanel = feedItemIds => {
    this.setState(
      { isOpenActivityPanel: !this.state.isOpenActivityPanel },
      () => {
        if (this.state.isOpenActivityPanel === false) {
          this.props.onUpdateFeedItems(feedItemIds);
        }
      }
    );
  };

  handleToggleSideBar = () => {
    this.setState({ isOpenSideBar: !this.state.isOpenSideBar });
  };

  handleCloseWelcome = () => {
    this.setState({ isOpenWelcome: false }, () => {
      this.props.onUpdateOpenedAccount();
      this.handleCheckRestoreBackup();
    });
  };

  handleCheckRestoreBackup = () => {
    const userHasCanceledSync = getPendingRestoreStatus();
    if (userHasCanceledSync) {
      setTimeout(() => {
        this.setState({
          isHiddenMailboxPopup: false,
          mailboxPopupType: MAILBOX_POPUP_TYPES.RESTORE_BACKUP
        });
      }, RESTORE_BACKUP_POPUP_DELAY);
    }
  };

  handleShowEnableBackupPopup = () => {
    this.setState({
      isHiddenMailboxPopup: false,
      mailboxPopupType: MAILBOX_POPUP_TYPES.ENABLE_BACKUP,
      mailboxPopupData: {
        step: 1,
        onEnableBackup: this.handleEnableBackup,
        onNoBackup: this.handleNoBackup
      }
    });
  };

  handleEnableBackup = async () => {
    let backupPath = myAccount.autoBackupPath;
    if (!backupPath) {
      await createDefaultBackupFolder();
      backupPath = await getDefaultBackupFolder();
      const fileName = defineBackupFileName('db');
      showSaveFileDialog(`${backupPath}/${fileName}`, selectedPath => {
        const lastSepIndex =
          selectedPath.lastIndexOf('/') > -1
            ? selectedPath.lastIndexOf('/')
            : selectedPath.lastIndexOf(`\\`);
        const folderPath = selectedPath.substr(0, lastSepIndex);
        this.handleEnableAccountBackup(folderPath);
      });
    } else {
      this.handleEnableAccountBackup(backupPath);
    }
  };

  handleEnableAccountBackup = async backupPath => {
    const frequency = 'daily';
    const timeUnit = 'days';
    const { nowDate, nextDate } = getAutoBackupDates(Date.now(), 1, timeUnit);

    await updateAccount({
      autoBackupEnable: true,
      autoBackupFrequency: frequency,
      autoBackupLastDate: nowDate,
      autoBackupNextDate: nextDate,
      autoBackupPath: backupPath
    });
    initAutoBackupMonitor();
    setShownEnableBackupPopup(myAccount.email);
    sendBackupEnabledMessage();
    this.handleCloseMailboxPopup();
  };

  handleNoBackup = () => {
    const data = this.state.mailboxPopupData;
    if (data.step !== 1) {
      setShownEnableBackupPopup(myAccount.email);
      this.handleCloseMailboxPopup();
      return;
    }
    this.setState({
      mailboxPopupData: {
        ...data,
        step: 2
      }
    });
  };

  handleCloseMailboxPopup = () => {
    this.setState({
      isHiddenMailboxPopup: true,
      mailboxPopupType: undefined,
      mailboxPopupData: undefined
    });
  };

  handleUpdateApp = async ({ accountId, recipientId, threadId }) => {
    this.setState({
      isHiddenMailboxPopup: false,
      mailboxPopupType: MAILBOX_POPUP_TYPES.CHANGE_ACCOUNT
    });
    const defaultMailboxSelected = {
      id: 1,
      text: 'Inbox'
    };
    const mailboxSelected =
      this.state.sectionSelected.params.mailboxSelected ||
      defaultMailboxSelected;
    if (!this.state.sectionSelected.params.mailboxSelected) {
      const type = SectionType.MAILBOX;
      const params = {
        mailboxSelected: defaultMailboxSelected
      };
      this.handleClickSection(type, params);
    }
    await this.props.onUpdateAccountApp({
      mailboxSelected,
      accountId,
      recipientId
    });
    if (threadId) {
      const threadType = SectionType.THREAD;
      const openThreadParams = {
        mailboxSelected: defaultMailboxSelected,
        threadIdSelected: threadId
      };
      this.handleClickSection(threadType, openThreadParams);
      this.props.onNotificationClicked({ threadId });
    }
  };

  initEventHandlers = () => {
    addEvent(Event.ENABLE_WINDOW, this.enableWindowListenerCallback);
    addEvent(Event.LOAD_APP, this.loadAppListenerCallback);
    addEvent(Event.LOAD_EVENTS, this.loadEventsListenerCallback);
    addEvent(Event.REFRESH_THREADS, this.refreshThreadsListenerCallback);
    addEvent(Event.STOP_LOAD_SYNC, this.stopLoadSyncListenerCallback);
    addEvent(Event.STORE_LOAD, this.storeLoadListenerCallback);
    addEvent(Event.UPDATE_LOADING_SYNC, this.updateLoadingSync);
    addEvent(
      Event.UPDATE_THREAD_EMAILS,
      this.updateThreadEmailsListenerCallback
    );
    addEvent(
      Event.CHANGE_SET_TRUSTED_ACCOUNT,
      this.changeAccountIsTrustedCallback
    );
    addEvent(Event.DEVICE_REMOVED, this.deviceRemovedListenerCallback);
    addEvent(Event.PASSWORD_CHANGED, this.passwordChangedListenerCallback);
    addEvent(Event.DISABLE_WINDOW, this.disableWindowListenerCallback);
    addEvent(Event.ACCOUNT_DELETED, this.accountDeletedListenerCallback);
    addEvent(Event.SET_SECTION_TYPE, this.setSectionTypeListenerCallback);
    addEvent(Event.SUSPENDED_ACCOUNT, this.suspendedAccountListenerCallback);
    addEvent(Event.BIG_UPDATE_AVAILABLE, this.handleBigUpdateListenerCallback);
    addEvent(Event.BACKUP_PROGRESS, this.handleBackupProgress);
    addEvent(
      Event.REACTIVATED_ACCOUNT,
      this.reactivatedAccountListenerCallback
    );
    addEvent(
      Event.LOCAL_BACKUP_DISABLE_EVENTS,
      this.localBackupDisableEventsListenerCallback
    );
    addEvent(
      Event.LOCAL_BACKUP_ENABLE_EVENTS,
      this.localBackupEnableEventsListenerCallback
    );
    addEvent(Event.OPEN_PLUS, this.handleOpenPlus);
    addEvent(Event.RESTORE_BACKUP_INIT, this.restoreBackupInitListenerCallback);
    addEvent(Event.REFRESH_MAILBOX_SYNC, this.refreshMailboxSync);
    addEvent(Event.LOCAL_BACKUP_SUCCESS, this.handleBackupFinish);
    addEvent(Event.LOCAL_BACKUP_FAILED, this.handleBackupFailed);
  };

  removeEventHandlers = () => {
    removeEvent(Event.ENABLE_WINDOW, this.enableWindowListenerCallback);
    removeEvent(Event.LOAD_APP, this.loadAppListenerCallback);
    removeEvent(Event.LOAD_EVENTS, this.loadEventsListenerCallback);
    removeEvent(Event.REFRESH_THREADS, this.refreshThreadsListenerCallback);
    removeEvent(Event.STOP_LOAD_SYNC, this.stopLoadSyncListenerCallback);
    removeEvent(Event.STORE_LOAD, this.storeLoadListenerCallback);
    removeEvent(Event.UPDATE_LOADING_SYNC, this.updateLoadingSync);
    removeEvent(
      Event.UPDATE_THREAD_EMAILS,
      this.updateThreadEmailsListenerCallback
    );
    removeEvent(
      Event.CHANGE_SET_TRUSTED_ACCOUNT,
      this.changeAccountIsTrustedCallback
    );
    removeEvent(Event.DEVICE_REMOVED, this.deviceRemovedListenerCallback);
    removeEvent(Event.PASSWORD_CHANGED, this.passwordChangedListenerCallback);
    removeEvent(Event.DISABLE_WINDOW, this.disableWindowListenerCallback);
    removeEvent(Event.ACCOUNT_DELETED, this.accountDeletedListenerCallback);
    removeEvent(Event.SET_SECTION_TYPE, this.setSectionTypeListenerCallback);
    removeEvent(Event.SUSPENDED_ACCOUNT, this.suspendedAccountListenerCallback);
    removeEvent(Event.BACKUP_PROGRESS, this.handleBackupProgress);
    removeEvent(
      Event.REACTIVATED_ACCOUNT,
      this.reactivatedAccountListenerCallback
    );
    removeEvent(
      Event.LOCAL_BACKUP_DISABLE_EVENTS,
      this.localBackupDisableEventsListenerCallback
    );
    removeEvent(
      Event.LOCAL_BACKUP_ENABLE_EVENTS,
      this.localBackupEnableEventsListenerCallback
    );
    removeEvent(
      Event.RESTORE_BACKUP_INIT,
      this.restoreBackupInitListenerCallback
    );
    removeEvent(Event.REFRESH_MAILBOX_SYNC, this.refreshMailboxSync);
    removeEvent(Event.OPEN_PLUS, this.handleOpenPlus);
    removeEvent(Event.LOCAL_BACKUP_SUCCESS, this.handleBackupFinish);
    removeEvent(Event.LOCAL_BACKUP_FAILED, this.handleBackupFailed);
  };

  enableWindowListenerCallback = () => {
    this.setState({
      isHiddenMailboxPopup: true,
      mailboxPopupType: undefined,
      mailboxPopupData: undefined
    });
  };

  disableWindowListenerCallback = () => {
    this.setState({
      isHiddenMailboxPopup: false,
      mailboxPopupType: MAILBOX_POPUP_TYPES.ONLY_BACKDROP
    });
  };

  loadEventsListenerCallback = params => {
    this.props.onLoadEvents(params);
  };

  loadAppListenerCallback = ({ mailbox, accountId, recipientId, threadId }) => {
    this.handleUpdateApp({ mailbox, accountId, recipientId, threadId });
  };

  refreshThreadsListenerCallback = eventParams => {
    if (this.state.sectionSelected.params.mailboxSelected) {
      const currentLabelId = this.state.sectionSelected.params.mailboxSelected
        .id;
      this.props.onLoadThreads({
        labelId: Number(currentLabelId),
        clear: true
      });
    }
    if (this.state.sectionSelected.params.threadIdSelected) {
      this.props.onLoadEmails(
        this.state.sectionSelected.params.threadIdSelected
      );
    }
    if (eventParams) {
      const { labelIds } = eventParams;
      this.props.onUpdateUnreadEmailsBadge(labelIds);
    }
  };

  stopLoadSyncListenerCallback = () => {
    this.props.onStopLoadSync();
  };

  storeLoadListenerCallback = ({
    profileHasChanged,
    completedTask,
    feedItemHasAdded,
    labelIds,
    threadIds,
    labels,
    badgeLabelIds,
    hasStopLoad,
    removedLabels,
    updatedLabels
  }) => {
    let activity = undefined;
    let label = undefined;

    if (profileHasChanged) {
      activity = setAvatarUpdatedTimestamp(Date.now());
      this.props.onAccountsChanged();
    }

    if (feedItemHasAdded) {
      this.props.onLoadFeedItems(true);
    }

    if (completedTask) {
      this.props.onUpdateLoadingSync({ completedTask });
    }

    const currentSectionType = this.state.sectionSelected.type;
    const isRenderingSettings = currentSectionType === SectionType.SETTINGS;
    if (isRenderingSettings && labelIds) {
      this.props.onLoadThreads(
        {
          labelId: Number(labelIds[0]),
          clear: true
        },
        hasStopLoad
      );
    }
    if (!isRenderingSettings && (labelIds || threadIds)) {
      const isRenderingMailbox = currentSectionType === SectionType.MAILBOX;
      const isRenderingThread = currentSectionType === SectionType.THREAD;
      const currentThreadId = this.state.sectionSelected.params
        .threadIdSelected;
      const currentLabelId = this.state.sectionSelected.params.mailboxSelected
        .id;
      const currentMailboxSize = this.props[currentLabelId];
      const limit =
        currentMailboxSize > THREADS_SIZE ? currentMailboxSize : undefined;
      if (labelIds && isRenderingMailbox) {
        if (labelIds.includes(currentLabelId)) {
          this.props.onLoadThreads(
            {
              labelId: Number(currentLabelId),
              clear: true,
              limit
            },
            hasStopLoad
          );
        } else if (hasStopLoad) {
          if (!activity) activity = stopLoadSync();
          else this.props.onStopLoadSync();
        }
      } else if (threadIds && isRenderingThread) {
        if (threadIds.includes(currentThreadId)) {
          this.props.onLoadThreadsAndEmails(
            {
              labelId: Number(currentLabelId),
              clear: true,
              limit
            },
            currentThreadId,
            hasStopLoad
          );
        } else {
          this.props.onLoadThreads(
            {
              labelId: Number(currentLabelId),
              clear: true,
              limit
            },
            hasStopLoad
          );
        }
      } else if (threadIds && isRenderingMailbox) {
        this.props.onLoadThreads(
          {
            labelId: Number(currentLabelId),
            clear: true,
            limit
          },
          hasStopLoad
        );
      }
    } else {
      if (hasStopLoad) {
        if (!activity) activity = stopLoadSync();
        else this.props.onStopLoadSync();
      }
    }

    if (labels) {
      label = addLabels(labels);
    }
    if (removedLabels && removedLabels.length >= 0) {
      if (!label) label = removeLabels(removedLabels);
      else this.props.onRemoveLabels(removedLabels);
    }

    if (updatedLabels && updatedLabels.length >= 0) {
      if (!label) label = updateLabels(updatedLabels);
      else this.props.onUpdateLabels(updatedLabels);
    }

    if (badgeLabelIds) {
      let labelIdsBadge = [];
      if (badgeLabelIds.includes(LabelType.inbox.id))
        labelIdsBadge = [...labelIdsBadge, LabelType.inbox.id];
      if (badgeLabelIds.includes(LabelType.spam.id))
        labelIdsBadge = [...labelIdsBadge, LabelType.spam.id];
      if (badgeLabelIds.includes(LabelType.draft.id))
        labelIdsBadge = [...labelIdsBadge, LabelType.draft.id];
      if (labelIdsBadge.length)
        this.props.onUpdateUnreadEmailsBadge(labelIdsBadge);
    }

    if (activity || label) {
      this.props.onAddDataApp({ activity, label });
    }
  };

  changeAccountIsTrustedCallback = eventParams => {
    this.props.onChangingTrustedContact(eventParams);
  };

  handleSnackbarDismiss = () => {
    const currentSnackbar = this.state.backupSnackbar || {};
    this.setState({
      backupSnackbar: {
        ...currentSnackbar,
        hide: true
      }
    });
  };

  handleBackupProgress = data => {
    const currentSnackbar = this.state.backupSnackbar || {};
    if (!currentSnackbar.color) {
      currentSnackbar.color = randomcolor({
        seed: data.name || data.email,
        luminosity: mySettings.theme === 'dark' ? 'dark' : 'bright'
      });
    }
    if (data.username && data.domain) {
      currentSnackbar.avatarUrl = `${avatarBaseUrl}${data.domain}/${
        data.username
      }`;
    }
    this.setState({
      backupSnackbar: {
        ...currentSnackbar,
        ...data
      }
    });
  };

  handleBackupFinish = () => {
    if (!this.state.backupSnackbar) return;
    const currentSnackbar = this.state.backupSnackbar;
    this.setState(
      {
        backupSnackbar: {
          ...currentSnackbar,
          progress: 100
        }
      },
      () => {
        setTimeout(this.handleBackupCleanUp, 2000);
      }
    );
  };

  handleBackupFailed = () => {
    if (!this.state.backupSnackbar) return;
    const currentSnackbar = this.state.backupSnackbar || {};
    this.setState(
      {
        backupSnackbar: {
          ...currentSnackbar,
          progress: -2
        }
      },
      () => {
        setTimeout(this.handleBackupCleanUp, 2000);
      }
    );
  };

  handleBackupCleanUp = () => {
    this.setState({
      backupSnackbar: undefined
    });
  };

  updateLoadingSync = eventParams => {
    const { totalTask, completedTask } = eventParams;
    this.props.onUpdateLoadingSync({ totalTask, completedTask });
  };

  updateThreadEmailsListenerCallback = eventParams => {
    if (!eventParams) return;
    const currentSectionType = this.state.sectionSelected.type;
    const isRenderingMailbox =
      currentSectionType === SectionType.MAILBOX ||
      currentSectionType === SectionType.THREAD;
    const currentLabelId = isRenderingMailbox
      ? this.state.sectionSelected.params.mailboxSelected.id
      : null;
    const { threadId, newEmailId, oldEmailId, badgeLabelIds } = eventParams;
    if (!threadId && !newEmailId && !oldEmailId) return;
    if (currentLabelId) {
      this.props.onLoadEmails(threadId);
      this.props.onUpdateEmailIdsThread({
        labelId: currentLabelId,
        threadId,
        emailIdToAdd: newEmailId,
        emailIdsToRemove: [oldEmailId]
      });
    }
    if (!newEmailId && !oldEmailId) {
      this.props.onUpdateUnreadEmailsBadge([LabelType.inbox.id]);
    }

    if (badgeLabelIds) {
      this.props.onUpdateUnreadEmailsBadge(badgeLabelIds);
    }
  };

  deviceRemovedListenerCallback = () => {
    this.setState({
      isHiddenMailboxPopup: false,
      mailboxPopupType: MAILBOX_POPUP_TYPES.DEVICE_REMOVED
    });
  };

  passwordChangedListenerCallback = () => {
    this.setState({
      isHiddenMailboxPopup: false,
      mailboxPopupType: MAILBOX_POPUP_TYPES.PASSWORD_CHANGED
    });
  };

  accountDeletedListenerCallback = () => {
    this.setState({
      isHiddenMailboxPopup: false,
      mailboxPopupType: MAILBOX_POPUP_TYPES.ACCOUNT_DELETED
    });
  };

  setSectionTypeListenerCallback = (type, mailboxSelected) => {
    this.handleClickSection(type, { mailboxSelected });
  };

  suspendedAccountListenerCallback = () => {
    this.setState({
      isHiddenMailboxPopup: false,
      mailboxPopupType: MAILBOX_POPUP_TYPES.SUSPENDED_ACCOUNT
    });
  };

  handleBigUpdateListenerCallback = data => {
    this.setState({
      isHiddenMailboxPopup: false,
      mailboxPopupType: MAILBOX_POPUP_TYPES.BIG_UPDATE_AVAILABLE,
      mailboxPopupData: data
    });
  };

  reactivatedAccountListenerCallback = () => {
    const isShowingPopup = !this.state.isHiddenMailboxPopup;
    const isVisibleSuspendedAccountPopup =
      this.state.mailboxPopupType === MAILBOX_POPUP_TYPES.SUSPENDED_ACCOUNT;
    if (isShowingPopup && isVisibleSuspendedAccountPopup) {
      this.handleCloseMailboxPopup();
    }
  };

  localBackupDisableEventsListenerCallback = () => {
    this.setState({
      isHiddenMailboxPopup: false,
      mailboxPopupType: MAILBOX_POPUP_TYPES.CREATING_BACKUP_FILE
    });
  };

  localBackupEnableEventsListenerCallback = () => {
    const isShowingPopup = !this.state.isHiddenMailboxPopup;
    const isVisibleCreatingBackupFilePopup =
      this.state.mailboxPopupType === MAILBOX_POPUP_TYPES.CREATING_BACKUP_FILE;
    if (isShowingPopup && isVisibleCreatingBackupFilePopup) {
      this.handleCloseMailboxPopup();
    }
  };

  restoreBackupInitListenerCallback = () => {
    this.setState({
      isHiddenMailboxPopup: false,
      mailboxPopupType: MAILBOX_POPUP_TYPES.RESTORE_BACKUP
    });
  };

  refreshMailboxSync = () => {
    this.handleClickSection(SectionType.MAILBOX, {
      mailboxSelected: {
        id: 1,
        text: 'Inbox'
      }
    });
    this.props.onLoadThreads({
      labelId: Number(1),
      clear: true
    });
    this.props.onUpdateUnreadEmailsBadge([
      LabelType.inbox.id,
      LabelType.spam.id
    ]);
  };

  handleOpenPlus = () => {
    this.handleClickSection(SectionType.SETTINGS, {
      tab: TAB.PLUS
    });
  };
}

PanelWrapper.propTypes = {
  isLoadAppCompleted: PropTypes.bool,
  inboxCount: PropTypes.number,
  onAccountsChanged: PropTypes.func,
  onAddDataApp: PropTypes.func,
  onAddLabels: PropTypes.func,
  onChangingTrustedContact: PropTypes.func,
  onLoadEmails: PropTypes.func,
  onLoadEvents: PropTypes.func,
  onLoadFeedItems: PropTypes.func,
  onLoadThreads: PropTypes.func,
  onLoadThreadsAndEmails: PropTypes.func,
  onRemoveEmailIdToThread: PropTypes.func,
  onRemoveLabels: PropTypes.func,
  onStopLoadSync: PropTypes.func,
  onUpdateAvatar: PropTypes.func,
  onUpdateLabels: PropTypes.func,
  onUnsendEmail: PropTypes.func,
  onUpdateAccountApp: PropTypes.func,
  onNotificationClicked: PropTypes.func,
  onUpdateEmailIdsThread: PropTypes.func,
  onUpdateLoadingSync: PropTypes.func,
  onUpdateOpenedAccount: PropTypes.func,
  onUpdateFeedItems: PropTypes.func,
  onUpdateUnreadEmailsBadge: PropTypes.func,
  threadsCount: PropTypes.number
};

export { PanelWrapper as default, MAILBOX_POPUP_TYPES };
