import { connect } from 'react-redux';
import { getLabelsIncluded } from '../selectors/labels';
import {
  makeGetLabelIdsFromThreads,
  makeGetThreads,
  makeGetThreadIds,
  makeGetThreadsSelected
} from '../selectors/threads';
import * as actions from '../actions/index';
import HeaderThreadOptionsWrapper from '../components/HeaderThreadOptionsWrapper';
import { LabelType } from '../utils/electronInterface';
import { sendPrintThreadEvent } from '../utils/ipc';

const shouldMarkAsUnread = (threads, itemsChecked) => {
  const hasUnread = threads.find(thread => {
    if (itemsChecked.has(thread.get('threadId'))) {
      return thread.get('unread');
    }
    return false;
  });
  return hasUnread !== undefined;
};

const makeMapStateToProps = () => {
  const getThreadIds = makeGetThreadIds();
  const getThreads = makeGetThreads();
  const getThreadsSelected = makeGetThreadsSelected();
  const getLabelIdsFromThreads = makeGetLabelIdsFromThreads();

  const mapStateToProps = (state, ownProps) => {
    const threads = getThreads(state, ownProps);
    const threadIds = getThreadIds(state, ownProps);
    const threadsSelected = getThreadsSelected(state, ownProps);
    const threadsLabelIds = getLabelIdsFromThreads(state, {
      ...ownProps,
      threadsSelected
    });
    const labels = getLabelsIncluded(state, threadsLabelIds);
    const markAsUnread = ownProps.itemsChecked
      ? !shouldMarkAsUnread(threads, ownProps.itemsChecked)
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
    onRemoveLabel: (threadIds, labelIdToRemove) => {
      const currentLabelId = ownProps.mailboxSelected.id;
      const shouldGoBack =
        !ownProps.threadIdSelected || currentLabelId === labelIdToRemove;
      dispatch(
        actions.removeLabelIdThreads(currentLabelId, threadIds, labelIdToRemove)
      ).then(() => {
        if (shouldGoBack) ownProps.onBackOption();
      });
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

const HeaderThreadOptions = connect(makeMapStateToProps, mapDispatchToProps)(
  HeaderThreadOptionsWrapper
);

export default HeaderThreadOptions;
