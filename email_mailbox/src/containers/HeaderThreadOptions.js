import { connect } from 'react-redux';
import { getLabelsIncluded } from '../selectors/labels';
import { makeGetThreadIds, makeGetThreadsSelected } from '../selectors/threads';
import * as actions from '../actions/index';
import HeaderThreadOptionsWrapper from '../components/HeaderThreadOptionsWrapper';
import { LabelType } from '../utils/electronInterface';
import { List } from 'immutable';
import { sendPrintThreadEvent } from '../utils/ipc';

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

const makeMapStateToProps = () => {
  const getThreadIds = makeGetThreadIds();
  const getThreadsSelected = makeGetThreadsSelected();

  const mapStateToProps = (state, ownProps) => {
    const mailbox = state.get('threads').get(`${ownProps.mailboxSelected.id}`);
    const threads = mailbox.get('list') || List([]);
    const threadIds = getThreadIds(state, ownProps.mailboxSelected.id);
    const threadsSelected = getThreadsSelected(state, ownProps);
    const uniqueIdsSelected = threadsSelected.map(
      thread => thread.threadIdDB || thread.emailId
    );
    const threadsLabelIds = getLabelIdsFromThreadIds(
      threads,
      uniqueIdsSelected
    );
    const labels = getLabelsIncluded(state, threadsLabelIds);
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

  return mapStateToProps;
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
      const labelId = ownProps.mailboxSelected.id;
      dispatch(actions.removeThreadsDrafts(labelId, draftsParams)).then(() =>
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
