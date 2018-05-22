import { connect } from 'react-redux';
import * as actions from '../actions/index';
import MailboxHeaderView from '../components/MailboxHeader';
import { CustomCheckboxStatus } from '../components/CustomCheckbox';
import { myAccount } from '../utils/electronInterface';
import { getTwoCapitalLetters } from '../utils/StringUtils';

const mapStateToProps = state => {
  const multiselect = state.get('activities').get('multiselect');
  const threadsSelected = getThreadsSelected(state.get('threads'), multiselect);
  const labels = getLabelIncluded(
    state.get('labels'),
    state.get('threads'),
    threadsSelected,
    multiselect
  );
  const markAsUnread = shouldMarkAsUnread(state.get('threads'), multiselect);
  const suggestions = state.get('suggestions');
  const allLabels = state
    .get('labels')
    .toArray()
    .map(label => label.toJS());
  return {
    multiselect,
    threadsSelected,
    labels,
    allLabels,
    threadsSuggestions: suggestions.get('threads'),
    hints: suggestions.get('hints'),
    errorSuggestions: suggestions.get('error'),
    markAsUnread,
    allSelected: threadsSelected.length === state.get('threads').size,
    showSelectAllOption: true,
    accountLetters: getTwoCapitalLetters(myAccount.name)
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onBackOption: () => {
      return dispatch(actions.deselectThreads(true));
    },
    onDeselectThreads: () => {
      return dispatch(actions.deselectThreads(false));
    },
    onSelectThreads: () => {
      return dispatch(actions.selectThreads());
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
      ownProps.onClickMailboxSelected('search');
      return dispatch(actions.searchThreads(params));
    },
    onSearchChange: filter => {
      return dispatch(actions.loadSuggestions(filter));
    },
    onSearchSelectThread: threadId => {
      dispatch(actions.selectThread(threadId));
      ownProps.onClickThreadIdSelected(threadId, ownProps.mailbox);
    }
  };
};

function getThreadsSelected(threads, multiselect) {
  if (!multiselect) {
    return [];
  }
  return threads.reduce(function(ids, thread) {
    if (thread.get('selected')) {
      const selectedThread = {
        threadIdStore: thread.get('id'),
        threadIdDB: thread.get('threadId')
      };
      ids.push(selectedThread);
    }
    return ids;
  }, []);
}

const shouldMarkAsUnread = (threads, multiselect) => {
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
};

const getLabelIncluded = (labels, threads, selectThreads, multiselect) => {
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
    let checked = CustomCheckboxStatus.NONE;
    if (hasLabels[labelId] === selectThreads.length) {
      checked = CustomCheckboxStatus.COMPLETE;
    } else if (hasLabels[labelId]) {
      checked = CustomCheckboxStatus.PARTIAL;
    }
    lbs.push({
      id: labelId,
      text: labelText,
      checked
    });
    return lbs;
  }, []);
};

const MailboxHeader = connect(mapStateToProps, mapDispatchToProps)(
  MailboxHeaderView
);

export default MailboxHeader;
