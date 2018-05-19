import { connect } from 'react-redux';
import {
  loadEvents,
  loadThreads,
  filterThreadsByUnread
} from '../actions/index';
import ThreadsView from '../components/Threads';
import { ButtonSyncType } from '../components/ButtonSync';
import { LabelType } from './../utils/electronInterface';

const mapStateToProps = (state, ownProps) => {
  const mailboxTitle = LabelType[ownProps.mailbox].text;
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

const defineStatus = isSyncing => {
  return isSyncing ? ButtonSyncType.LOAD : ButtonSyncType.STOP;
};

const defineContactType = labelId => {
  if (labelId === LabelType.sent.id || labelId === LabelType.draft.id) {
    return ['to'];
  }
  if (labelId === LabelType.all.id) {
    return ['from', 'to'];
  }
  return ['from'];
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onLoadThreads: (mailbox, clear, timestamp) => {
      const labelId = LabelType[mailbox].id;
      const contactTypes = defineContactType(labelId);
      const params =
        mailbox === 'search'
          ? {
              labelId,
              clear,
              timestamp,
              contactTypes,
              ...ownProps.searchParams
            }
          : {
              labelId,
              clear,
              timestamp,
              contactTypes
            };
      dispatch(loadThreads(params));
    },
    onLoadEvents: () => {
      const labelId = LabelType[ownProps.mailbox].id;
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
