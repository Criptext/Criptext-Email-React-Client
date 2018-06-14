import { connect } from 'react-redux';
import * as actions from '../actions/index';
import HeaderThreadOptionsWrapper from '../components/HeaderThreadOptionsWrapper';
import { LabelType } from '../utils/electronInterface';
import { Set } from 'immutable';

const defineOneThreadSelected = (threads, threadId) => {
  const thread = threads.find(thread => {
    return thread.get('id') === threadId;
  });
  return [
    {
      threadIdStore: thread.get('id'),
      threadIdDB: thread.get('threadId')
    }
  ];
};

const defineThreadsSelected = (threads, itemsChecked) => {
  return threads
    .filter(thread => itemsChecked.has(thread.get('id')))
    .toArray()
    .map(thread => ({
      threadIdStore: thread.get('id'),
      threadIdDB: thread.get('threadId')
    }));
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
    const labelId = label.get('id');
    const labelText = label.get('text');
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

const getThreadsIds = threads => {
  const threadIds = threads.map(thread => {
    return thread.get('id');
  });
  return Set(threadIds);
};

const shouldMarkAsUnread = (threads, itemsChecked) => {
  const hasUnread = threads.find(thread => {
    if (itemsChecked.has(thread.get('id'))) {
      return !thread.get('unread');
    }
    return false;
  });
  return hasUnread !== undefined;
};

const mapStateToProps = (state, ownProps) => {
  const threads = state.get('threads');
  const threadIds = getThreadsIds(threads);
  const labels = getLabelIncluded(
    state.get('labels').filter(item => item.get('type') === 'custom'),
    ownProps.thread ? ownProps.thread.labels : null
  );
  const markAsUnread = ownProps.itemsChecked
    ? shouldMarkAsUnread(threads, ownProps.itemsChecked)
    : !ownProps.threadIdSelected.unread;
  const threadsSelected = ownProps.itemsChecked
    ? defineThreadsSelected(threads, ownProps.itemsChecked)
    : defineOneThreadSelected(threads, ownProps.threadIdSelected);
  const allSelected = ownProps.itemsChecked
    ? threadIds.size === ownProps.itemsChecked.size
    : false;
  return {
    allSelected,
    markAsUnread,
    threadsSelected,
    threadIds,
    labels,
    allLabels: state.get('labels')
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onAddLabel: (threadIds, label) => {
      dispatch(actions.addThreadsLabel(threadIds, label)).then(() =>
        ownProps.onBackOption()
      );
    },
    onAddMoveLabel: (threadIds, labelId) => {
      dispatch(actions.addMoveThreadsLabel(threadIds, labelId)).then(() =>
        ownProps.onBackOption()
      );
    },
    onRemoveLabel: (threadsIds, label) => {
      dispatch(actions.removeThreadsLabel(threadsIds, label)).then(() =>
        ownProps.onBackOption()
      );
    },
    onMarkRead: (threadsIds, read) => {
      const labelId = LabelType[ownProps.mailboxSelected].id;
      const operation = read ? -1 : 1;
      const paramsLabel =
        labelId === LabelType.inbox.id || labelId === LabelType.spam.id
          ? {
              id: labelId,
              badgeOperation: threadsIds.length * operation
            }
          : null;

      dispatch(actions.updateUnreadThreads(threadsIds, read, paramsLabel)).then(
        () => ownProps.onBackOption()
      );
    },
    onRemoveThreads: threadsIds => {
      dispatch(actions.removeThreads(threadsIds)).then(() =>
        ownProps.onBackOption()
      );
    },
    onRemoveDrafts: params => {
      const isDraft = true;
      dispatch(actions.removeThreads(params, isDraft)).then(() =>
        ownProps.onBackOption()
      );
    }
  };
};

const ThreadHeader = connect(mapStateToProps, mapDispatchToProps)(
  HeaderThreadOptionsWrapper
);

export default ThreadHeader;
