import { connect } from 'react-redux';
import * as actions from '../actions/index';
import MailboxHeaderView from '../components/MailboxHeader';

const mapStateToProps = state => {
  const multiselect = state.get('activities').get('multiselect');
  const threadsSelected = getThreadsSelected(state.get('threads'), true);
  const labels = getLabelIncluded(
    state.get('labels'),
    state.get('threads'),
    threadsSelected,
    true
  );
  const markAsUnread = shouldMarkAsUnread(state.get('threads'), true);
  return {
    multiselect,
    threadsSelected,
    labels,
    allLabels: state.get('labels'),
    threadsSuggestions: state.get('threadsSuggestions'),
    markAsUnread,
    allSelected: threadsSelected.length === state.get('threads').size,
    showSelectAllOption: true
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onDeselectThreads: () => {
      return dispatch(actions.deselectThreads(false));
    },
    onBackOption: () => {
      return dispatch(actions.deselectThreads(true));
    },
    onSelectThreads: () => {
      return dispatch(actions.selectThreads());
    },
    onMoveThreads: (threadsIds, label) => {
      return dispatch(actions.moveThreads(threadsIds, label));
    },
    onAddLabel: (threadsIds, label) => {
      return dispatch(actions.addThreadsLabel(threadsIds, label));
    },
    onRemoveLabel: (threadsIds, label) => {
      return dispatch(actions.removeThreadsLabel(threadsIds, label));
    },
    onMarkRead: (threadsIds, read) => {
      return dispatch(actions.markThreadsRead(threadsIds, read));
    },
    onSearchThreads: params => {
      return dispatch(actions.searchThreads(params));
    },
    onSearchChange: filter => {
      return dispatch(actions.loadThreadsSuggestions(filter));
    } 
  };
};

function getThreadsSelected(threads, multiselect) {
  if (!multiselect) {
    return [];
  }
  return threads.reduce(function(ids, thread) {
    if (thread.get('selected')) {
      ids.push(thread.get('id'));
    }
    return ids;
  }, []);
}

function shouldMarkAsUnread(threads, multiselect) {
  if (!multiselect) {
    return null;
  }
  let markUnread = true;
  threads.every(thread => {
    if (!thread.get('selected')) {
      return true;
    }
    if (thread.get('unread')) {
      markUnread = false;
      return false;
    }
    return true;
  });

  return markUnread;
}

function getLabelIncluded(labels, threads, selectThreads, multiselect) {
  if (!multiselect) {
    return [];
  }

  const hasLabels = threads.reduce(function(lbs, thread) {
    if (!thread.get('selected')) {
      return lbs;
    }

    return thread.get('labels').reduce(function(lbs, label) {
      if (!lbs[label]) {
        lbs[label] = 1;
      } else {
        lbs[label]++;
      }
      return lbs;
    }, lbs);
  }, {});
  return labels.reduce(function(lbs, label) {
    const labelId = label.get('id');
    const labelText = label.get('text');
    let checked = 'none';
    if (hasLabels[labelId] === selectThreads.length) {
      checked = 'all';
    } else if (hasLabels[labelId]) {
      checked = 'partial';
    }
    lbs.push({
      id: labelId,
      text: labelText,
      checked
    });
    return lbs;
  }, []);
}

const MailboxHeader = connect(mapStateToProps, mapDispatchToProps)(
  MailboxHeaderView
);

export default MailboxHeader;
