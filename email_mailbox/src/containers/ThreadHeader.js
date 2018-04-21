import { connect } from 'react-redux';
import * as actions from '../actions/index';
import ThreadHeaderView from '../components/ThreadHeader';

const formThreadParams = thread => {
  return {
    threadIdStore: thread.id,
    threadIdDB: thread.threadId
  };
};

const mapStateToProps = (state, ownProps) => {
  const labels = getLabelIncluded(
    state.get('labels'),
    ownProps.thread ? ownProps.thread.labels : null
  );
  const markAsUnread = shouldMarkAsUnread(state.get('threads'));
  return {
    markAsUnread,
    threadsSelected: [
      ownProps.thread ? formThreadParams(ownProps.thread) : null
    ],
    labels,
    allLabels: state.get('labels'),
    history: ownProps.history
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onBackOption: () => {
      ownProps.onClickThreadBack();
    },
    onAddLabel: (threadsIds, label) => {
      return dispatch(actions.addThreadsLabel(threadsIds, label));
    },
    onRemoveLabel: (threadsIds, label) => {
      return dispatch(actions.removeThreadsLabel(threadsIds, label));
    },
    onMarkRead: (threadsIds, read) => {
      return dispatch(actions.markThreadsRead(threadsIds, read));
    }
  };
};

const getLabelIncluded = (labels, threadLabels) => {
  if (!threadLabels) return [];
  const hasLabels = threadLabels.reduce((lbs, label) => {
    if (!lbs[label]) {
      lbs[label] = 1;
    } else {
      lbs[label]++;
    }
    return lbs;
  }, {});

  return labels.reduce((lbs, label) => {
    const labelId = label.id;
    const labelText = label.text;
    let checked = 'none';
    if (hasLabels[labelId]) {
      checked = 'all';
    }
    lbs.push({
      id: labelId,
      text: labelText,
      checked
    });
    return lbs;
  }, []);
};

const shouldMarkAsUnread = threads => {
  let markUnread = true;
  threads.every(thread => {
    if (!thread.selected) {
      return true;
    }
    if (thread.unread) {
      markUnread = false;
      return false;
    }
    return true;
  });

  return markUnread;
};

const ThreadHeader = connect(mapStateToProps, mapDispatchToProps)(
  ThreadHeaderView
);

export default ThreadHeader;
