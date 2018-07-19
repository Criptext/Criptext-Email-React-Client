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
  const filteredLabels = labels.filter(item => {
    const isStarred = item.get('id') === LabelType.starred.id;
    const isCustom = item.get('type') === 'custom';
    return isStarred || isCustom;
  });

  if (!threadLabels) return [];
  const hasLabels = threadLabels.reduce((lbs, label) => {
    if (!lbs[label]) {
      lbs[label] = 1;
    } else {
      lbs[label]++;
    }
    return lbs;
  }, {});

  return filteredLabels.reduce((lbs, label) => {
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
  return !threads.size ? Set() : Set(threads.map(thread => thread.get('id')));
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

const getLabelIdsFromThreadIds = (state, threadIds) => {
  return state
    .get('threads')
    .filter(thread => threadIds.includes(thread.get('id')))
    .reduce((result, thread) => {
      const labels = thread.get('labels').toArray();
      return [...result, ...labels];
    }, []);
};

const mapStateToProps = (state, ownProps) => {
  const threads = state.get('threads');
  const threadIds = getThreadsIds(threads);
  const threadsSelected = ownProps.itemsChecked
    ? defineThreadsSelected(threads, ownProps.itemsChecked)
    : defineOneThreadSelected(threads, ownProps.threadIdSelected);
  const threadIdsSelected = threadsSelected.map(thread => thread.threadIdStore);
  const threadsLabelIds = getLabelIdsFromThreadIds(state, threadIdsSelected);
  const labels = getLabelIncluded(state.get('labels'), threadsLabelIds);
  const markAsUnread = ownProps.itemsChecked
    ? shouldMarkAsUnread(threads, ownProps.itemsChecked)
    : !ownProps.threadIdSelected.unread;
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
      dispatch(actions.addThreadsLabel(threadIds, label)).then(() => {
        if (ownProps.itemsChecked) {
          ownProps.onBackOption();
        }
      });
    },
    onAddMoveLabel: (threadIds, labelId, notMove) => {
      dispatch(
        actions.addMoveThreadsLabel({
          threadsParams: threadIds,
          labelId,
          notMove
        })
      ).then(() => ownProps.onBackOption());
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
    onRemoveThreads: async (threadsIds, backFirst) => {
      if (backFirst) {
        await ownProps.onBackOption();
        dispatch(actions.removeThreads(threadsIds));
      } else {
        dispatch(actions.removeThreads(threadsIds)).then(() =>
          ownProps.onBackOption()
        );
      }
    },
    onRemoveDrafts: params => {
      const isDraft = true;
      dispatch(actions.removeThreads(params, isDraft)).then(() =>
        ownProps.onBackOption()
      );
    }
  };
};

const HeaderThreadOptions = connect(
  mapStateToProps,
  mapDispatchToProps
)(HeaderThreadOptionsWrapper);

export default HeaderThreadOptions;
