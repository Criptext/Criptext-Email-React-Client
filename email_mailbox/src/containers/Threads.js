import { connect } from 'react-redux';
import {
  loadEvents,
  loadThreads,
  filterThreadsByUnread
} from '../actions/index';
import ThreadsView from '../components/ThreadsWrapper';
import { ButtonSyncType } from '../components/ButtonSync';
import { LabelType } from './../utils/electronInterface';

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

const defineRejectedLabels = labelId => {
  switch (labelId) {
    case LabelType.allmail.id:
      return [LabelType.spam.id, LabelType.trash.id, LabelType.draft.id];
    case LabelType.spam.id:
    case LabelType.trash.id:
      return [];
    default:
      return [LabelType.spam.id, LabelType.trash.id];
  }
};

const mapStateToProps = (state, ownProps) => {
  const mailboxTitle = LabelType[ownProps.mailboxSelected].text;
  const switchUnreadThreadsStatus = state
    .get('activities')
    .get('isFilteredByUnreadThreads');
  const buttonSyncStatus = defineStatus(
    state.get('activities').get('isSyncing')
  );
  const threads = state.get('threads');
  const unreadThreads = state
    .get('threads')
    .filter(thread => thread.get('unread'));
  return {
    buttonSyncStatus,
    mailboxTitle,
    switchUnreadThreadsStatus,
    threads: switchUnreadThreadsStatus ? unreadThreads : threads
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLoadThreads: (mailbox, clear, searchParams, timestamp) => {
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
              timestamp,
              contactTypes,
              contactFilter,
              plain: true,
              text: searchParams.text,
              rejectedLabelIds
            }
          : {
              labelId,
              clear,
              timestamp,
              contactTypes,
              rejectedLabelIds
            };
      dispatch(loadThreads(params));
    },
    onLoadEvents: () => {
      dispatch(loadEvents());
    },
    onUnreadToggle: enabled => {
      dispatch(filterThreadsByUnread(enabled));
    }
  };
};

const Threads = connect(
  mapStateToProps,
  mapDispatchToProps
)(ThreadsView);

export default Threads;
