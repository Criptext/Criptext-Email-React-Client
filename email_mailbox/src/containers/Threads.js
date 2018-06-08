import { connect } from 'react-redux';
import {
  loadEvents,
  loadThreads,
  filterThreadsByUnread
} from '../actions/index';
import ThreadsView from '../components/Threads';
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
    return ['to'];
  }
  if (labelId === LabelType.all.id) {
    return ['from', 'to'];
  }
  return ['from'];
};

const mapStateToProps = (state, ownProps) => {
  const mailboxTitle = LabelType[ownProps.mailboxSelected].text;
  const unreadFilter = state.get('activities').get('unreadFilter');
  const buttonSyncStatus = defineStatus(
    state.get('activities').get('isSyncing')
  );
  const threads = unreadFilter
    ? state.get('threads').filter(thread => {
        return thread.get('unread');
      })
    : state.get('threads');
  return {
    buttonSyncStatus,
    mailboxTitle,
    threads,
    unreadFilter
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onLoadThreads: (mailbox, clear, searchParams, timestamp) => {
      const labelId = LabelType[mailbox].id;
      const contactTypes = defineContactType(
        labelId,
        searchParams ? searchParams.from : null,
        searchParams ? searchParams.to : null
      );
      const rejectedLabelIds =
        labelId === LabelType.spam.id || labelId === LabelType.trash.id
          ? []
          : [LabelType.spam.id, LabelType.trash.id];
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
              text: searchParams.text
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
      const labelId = LabelType[ownProps.mailboxSelected].id;
      const clear = true;
      const params = {
        labelId,
        clear
      };
      dispatch(loadEvents(params));
    },
    onUnreadToggle: enabled => {
      dispatch(filterThreadsByUnread(enabled));
    }
  };
};

const Threads = connect(mapStateToProps, mapDispatchToProps)(ThreadsView);

export default Threads;
