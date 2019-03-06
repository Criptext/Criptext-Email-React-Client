import { connect } from 'react-redux';
import * as actions from '../actions/index';
import HeaderThreadOptionsWrapper from '../components/HeaderThreadOptionsWrapper';
import { LabelType } from '../utils/electronInterface';
import { Set, List } from 'immutable';
import { sendPrintThreadEvent } from '../utils/ipc';

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
  const mailbox = state.get('threads').get(`${ownProps.mailboxSelected.id}`);
  const threads = mailbox.get('list') || List([]);
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
      const currentLabelId = ownProps.mailboxSelected.id;
      dispatch(
        actions.addLabelIdThreads(currentLabelId, threadIds, labelId)
      ).then(() => {
        if (ownProps.itemsChecked) {
          ownProps.onBackOption();
        }
      });
    },
    onAddMoveLabel: (threadIds, labelId) => {
      const currentLabelId = ownProps.mailboxSelected.id;
      const isTrashCurrentLabelId = currentLabelId === LabelType.trash.id;
      const isSpamLabelIdToAdd = labelId === LabelType.spam.id;
      dispatch(
        actions.addMoveLabelIdThreads({
          threadsParams: threadIds,
          labelIdToAdd: labelId,
          labelIdToRemove:
            isSpamLabelIdToAdd && isTrashCurrentLabelId
              ? currentLabelId
              : undefined,
          currentLabelId
        })
      ).then(() => ownProps.onBackOption());
    },
    onRemoveLabel: (threadIds, labelId) => {
      const currentLabelId = ownProps.mailboxSelected.id;
      dispatch(
        actions.removeLabelIdThreads(currentLabelId, threadIds, labelId)
      ).then(() => ownProps.onBackOption());
    },
    onMarkRead: (threadIds, unread) => {
      const labelId = ownProps.mailboxSelected.id;
      dispatch(actions.updateUnreadThreads(threadIds, unread, labelId)).then(
        () => ownProps.onBackOption()
      );
    },
    onRemoveThreads: async (threadIds, backFirst) => {
      const labelId = ownProps.mailboxSelected.id;
      if (backFirst) {
        await ownProps.onBackOption();
        dispatch(actions.removeThreads(threadIds, labelId));
      } else {
        dispatch(actions.removeThreads(threadIds, labelId)).then(() =>
          ownProps.onBackOption()
        );
      }
    },
    onDiscardDrafts: draftsParams => {
      dispatch(actions.removeThreadsDrafts(draftsParams)).then(() =>
        ownProps.onBackOption()
      );
    },
    onPrintAllThread: () => {
      const threadId = ownProps.threadIdSelected;
      sendPrintThreadEvent(threadId);
    }
  };
};

const HeaderThreadOptions = connect(
  mapStateToProps,
  mapDispatchToProps
)(HeaderThreadOptionsWrapper);

export default HeaderThreadOptions;
