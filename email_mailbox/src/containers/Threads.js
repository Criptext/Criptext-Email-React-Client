import { connect } from 'react-redux';
import {
  loadEvents,
  loadThreads,
  filterThreadsByUnread,
  startLoadThread,
  removeThreads
} from '../actions/index';
import {
  getEmailsByLabelIds
} from './../utils/ipc';
import ThreadsView from '../components/ThreadsWrapper';
import { ButtonSyncType } from '../components/ButtonSync';
import { LabelType } from './../utils/electronInterface';
import { defineRejectedLabels } from '../utils/EmailUtils';
import { toLowerCaseWithoutSpaces } from './../utils/StringUtils';
import string from './../lang';

const defineStatus = isSyncing => {
  return isSyncing ? ButtonSyncType.LOAD : ButtonSyncType.STOP;
};

const defineContactType = (labelId, from, to) => {
  if (from || to) {
    if (from && to) return ['from', 'to'];
    else if (from) return ['from'];
    return ['to'];
  }

  if (labelId === LabelType.sent.id || labelId === LabelType.draft.id) {
    return ['to', 'cc'];
  }
  return ['from'];
};

const mapStateToProps = (state, ownProps) => {
  const mailboxIdText = toLowerCaseWithoutSpaces(
    LabelType[ownProps.mailboxSelected].text
  );
  const mailboxTitle = string.labelsItems[mailboxIdText];
  const switchUnreadThreadsStatus = state
    .get('activities')
    .get('isFilteredByUnreadThreads');
  const buttonSyncStatus = defineStatus(
    state.get('activities').get('isSyncing')
  );
  const isLoadingThreads = state.get('activities').get('isLoadingThreads');
  const threads = state.get('threads');
  const unreadThreads = state
    .get('threads')
    .filter(thread => thread.get('unread'));
  return {
    buttonSyncStatus,
    isLoadingThreads,
    mailboxTitle,
    switchUnreadThreadsStatus,
    threads: switchUnreadThreadsStatus ? unreadThreads : threads
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLoadThreads: (mailbox, clear, searchParams, date, threadIdRejected) => {
      dispatch(startLoadThread());
      const labelId = LabelType[mailbox].id;
      const contactTypes = defineContactType(
        labelId,
        searchParams ? searchParams.from : null,
        searchParams ? searchParams.to : null
      );
      const rejectedLabelIds = defineRejectedLabels(labelId);
      const contactFilter = searchParams
        ? { from: searchParams.from, to: searchParams.to }
        : undefined;
      const params =
        mailbox === 'search'
          ? {
              labelId,
              clear,
              date,
              contactTypes,
              contactFilter,
              plain: true,
              text: searchParams.text,
              rejectedLabelIds,
              threadIdRejected
            }
          : {
              labelId,
              clear,
              date,
              contactTypes,
              rejectedLabelIds,
              threadIdRejected
            };
      dispatch(loadThreads(params));
    },
    onLoadEvents: () => {
      dispatch(loadEvents());
    },
    onUnreadToggle: enabled => {
      dispatch(filterThreadsByUnread(enabled));
    },
    onEmptyTrash: async () => {
      const labelId = LabelType.trash.id;
      const emails = await getEmailsByLabelIds([labelId]);
      const threadsParams = emails.map(email => ({
        threadIdDB: email.threadId
      }));
      dispatch(removeThreads(threadsParams, labelId));
    }
  };
};

const Threads = connect(
  mapStateToProps,
  mapDispatchToProps
)(ThreadsView);

export default Threads;
