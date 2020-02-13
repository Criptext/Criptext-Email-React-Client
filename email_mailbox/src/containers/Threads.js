import { connect } from 'react-redux';
import {
  loadApp,
  loadEvents,
  loadThreads,
  filterThreadsOrLoadMoreByUnread,
  startLoadThread,
  removeThreads,
  updateSwitchThreads
} from '../actions/index';
import { getEmailsByLabelIds } from './../utils/ipc';
import ThreadsView from '../components/ThreadsWrapper';
import { ButtonSyncType } from '../components/ButtonSync';
import { EmptyMailboxStatus } from '../components/EmptyMailbox';
import { LabelType } from './../utils/electronInterface';
import { defineRejectedLabels } from '../utils/EmailUtils';
import { toLowerCaseWithoutSpaces } from './../utils/StringUtils';
import { storeValue } from '../utils/storage';
import string from './../lang';
import { List } from 'immutable';
import {
  defineContactType,
  defineParamsToLoadThread
} from './../utils/ThreadUtils';

const defineSyncStatus = isSyncing => {
  return isSyncing ? ButtonSyncType.LOAD : ButtonSyncType.STOP;
};

const defineMailboxStatus = (isLoadingThreads, mailboxSize) => {
  if (isLoadingThreads && !mailboxSize) return EmptyMailboxStatus.LOADING;
  return EmptyMailboxStatus.EMPTY;
};

const mapStateToProps = (state, ownProps) => {
  const mailboxIdText = toLowerCaseWithoutSpaces(ownProps.mailboxSelected.text);
  const mailboxTitle =
    string.labelsItems[mailboxIdText] || ownProps.mailboxSelected.text;
  const activities = state.get('activities');
  const switchState = activities.get('switchThread');
  const switchChecked = switchState.get('checked');
  const switchDisabled = switchState.get('disabled');
  const loadingSync = activities.get('loadingSync');
  const totalTask = loadingSync.get('totalTask');
  const completedTask = loadingSync.get('completedTask');
  const buttonSyncStatus = defineSyncStatus(
    state.get('activities').get('isSyncing')
  );
  const isLoadingThreads = state.get('activities').get('isLoadingThreads');
  const mailbox = state.get('threads').get(`${ownProps.mailboxSelected.id}`);
  const threads = mailbox ? mailbox.get('list') : List([]);
  const unreadThreads = threads.filter(thread => thread.get('unread'));
  const mailboxStatus = defineMailboxStatus(isLoadingThreads, threads.size);
  return {
    buttonSyncStatus,
    completedTask,
    currentUnreadThreadsLength: unreadThreads.size,
    isLoadingThreads,
    mailboxTitle,
    mailboxStatus,
    switchChecked,
    switchDisabled,
    threads: switchChecked ? unreadThreads : threads,
    totalTask
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLoadApp: (mailbox, clear) => {
      const params = defineParamsToLoadThread(mailbox, clear);
      dispatch(loadApp(params));
    },
    onLoadEvents: () => {
      dispatch(loadEvents({}));
    },
    onLoadThreads: (
      mailbox,
      clear,
      searchParams,
      date,
      threadIdRejected,
      unread
    ) => {
      dispatch(startLoadThread());
      const params = defineParamsToLoadThread(
        mailbox,
        clear,
        searchParams,
        date,
        threadIdRejected,
        unread
      );
      dispatch(loadThreads(params)).then(async () => {
        if (mailbox === 'search' && params.plain) {
          await storeValue(params.text);
        }
      });
    },
    onUnreadToggle: (
      checked,
      currentUnreadThreadsLength,
      mailbox,
      loadParams
    ) => {
      dispatch(updateSwitchThreads({ checked, disabled: true }));
      const labelId = mailbox.id;
      const rejectedLabelIds = defineRejectedLabels(labelId);
      const contactTypes = defineContactType(labelId, null, null);
      const paramsToLoadMoreThreads = {
        ...loadParams,
        labelId,
        rejectedLabelIds,
        contactTypes
      };
      dispatch(
        filterThreadsOrLoadMoreByUnread(
          checked,
          currentUnreadThreadsLength,
          paramsToLoadMoreThreads
        )
      ).then(() => true);
    },
    onEmptyTrash: async () => {
      const labelId = LabelType.trash.id;
      const emails = await getEmailsByLabelIds({ labelIds: [labelId] });
      const threadsParams = emails.map(email => ({
        threadIdDB: email.threadId
      }));
      dispatch(removeThreads(threadsParams, labelId));
    }
  };
};

const Threads = connect(mapStateToProps, mapDispatchToProps)(ThreadsView);

export default Threads;
