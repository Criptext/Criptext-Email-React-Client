import { connect } from 'react-redux';
import * as actions from '../actions/index';
import HeaderThreadOptionsWrapper from '../components/HeaderThreadOptionsWrapper';
import { LabelType } from '../utils/electronInterface';
import { Set } from 'immutable';

const defineOneThreadSelected = (threads, threadId) => {
  const thread = threads.find(thread => {
    return thread.get('threadId') === threadId;
  });
  return [
    {
      threadIdDB: thread ? thread.get('threadId') : null
    }
  ];
};

const defineThreadsSelected = (threads, itemsChecked) => {
  return threads
    .filter(thread => itemsChecked.has(thread.get('uniqueId')))
    .toArray()
    .map(thread => ({
      threadIdDB: thread.get('threadId'),
      emailId: !thread.get('threadId') ? thread.get('id') : null
    }));
};

const getLabelIncluded = (labels, threadLabels) => {
  const filteredLabels = labels.filter(item => {
    const isStarred = item.get('id') === LabelType.starred.id;
    const isCustomAndVisible =
      item.get('type') === 'custom' && item.get('visible');
    return isStarred || isCustomAndVisible;
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
  return !threads.size
    ? Set()
    : Set(threads.map(thread => thread.get('uniqueId')));
};

const shouldMarkAsUnread = (threads, itemsChecked) => {
  const hasUnread = threads.find(thread => {
    if (itemsChecked.has(thread.get('threadId'))) {
      return !thread.get('unread');
    }
    return false;
  });
  return hasUnread !== undefined;
};

const getLabelIdsFromThreadIds = (threads, uniqueIds) => {
  return threads
    .filter(thread => uniqueIds.includes(thread.get('uniqueId')))
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
  const uniqueIdsSelected = threadsSelected.map(
    thread => thread.threadIdDB || thread.emailId
  );
  const threadsLabelIds = getLabelIdsFromThreadIds(threads, uniqueIdsSelected);
  const labels = getLabelIncluded(state.get('labels'), threadsLabelIds);
  const markAsUnread = ownProps.itemsChecked
    ? shouldMarkAsUnread(threads, ownProps.itemsChecked)
    : true;
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
    onAddLabel: (threadIds, labelId) => {
      dispatch(actions.addLabelIdThreads(threadIds, labelId)).then(() => {
        if (ownProps.itemsChecked) {
          ownProps.onBackOption();
        }
      });
    },
    onAddMoveLabel: (threadIds, labelId, notMove) => {
      dispatch(
        actions.addMoveLabelIdThreads({
          threadsParams: threadIds,
          labelId,
          notMove
        })
      ).then(() => ownProps.onBackOption());
    },
    onRemoveLabel: (threadIds, labelId) => {
      dispatch(actions.removeLabelIdThreads(threadIds, labelId)).then(() =>
        ownProps.onBackOption()
      );
    },
    onMarkRead: (threadIds, read) => {
      const labelId = LabelType[ownProps.mailboxSelected].id;
      const operation = read ? 'less' : 'add';
      const paramsLabel =
        labelId === LabelType.inbox.id || labelId === LabelType.spam.id
          ? {
              id: labelId,
              operation: operation,
              value: threadIds.length
            }
          : null;

      dispatch(actions.updateUnreadThreads(threadIds, read, paramsLabel)).then(
        () => ownProps.onBackOption()
      );
    },
    onRemoveThreads: async (threadIds, backFirst) => {
      if (backFirst) {
        await ownProps.onBackOption();
        dispatch(actions.removeThreads(threadIds));
      } else {
        dispatch(actions.removeThreads(threadIds)).then(() =>
          ownProps.onBackOption()
        );
      }
    }
  };
};

const HeaderThreadOptions = connect(
  mapStateToProps,
  mapDispatchToProps
)(HeaderThreadOptionsWrapper);

export default HeaderThreadOptions;
