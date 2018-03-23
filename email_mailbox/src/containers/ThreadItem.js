import { connect } from 'react-redux';
import * as actions from '../actions/index';
import ThreadItemWrapper from '../components/ThreadItemWrapper';
import { LabelType } from '../utils/const';
import { defineTimeByToday } from '../utils/TimeUtils';
import { getTwoCapitalLetters } from '../utils/StringUtils';
import randomcolor from 'randomcolor';

const getThreadClass = (thread, threadPos, selectedThread) => {
  if (thread.get('unread') && threadPos !== selectedThread) {
    return thread.get('selected') ? 'thread-unread-selected' : 'thread-unread';
  }
  return thread.get('selected') ? 'thread-read-selected' : 'thread-read';
};

const defineLabels = (labelIds, labels) => {
  const result = labelIds.toArray().map(labelId => {
    return labels.get(labelId.toString()).toObject();
  });
  return result ? result : [];
};

const mapStateToProps = (state, ownProps) => {
  const selectedThread = ownProps.selectedThread;
  const header = ownProps.thread.get('fromContactName').first();
  const letters = getTwoCapitalLetters(
    ownProps.thread.get('fromContactName').first()
  );
  const color = randomcolor({
    seed: header,
    luminosity: 'bright'
  });
  const thread = ownProps.thread.merge({
    date: defineTimeByToday(ownProps.thread.get('date'))
  });
  const labels = defineLabels(thread.get('labels'), state.get('labels'));

  return {
    myClass: getThreadClass(thread, ownProps.myIndex, selectedThread),
    thread,
    color,
    multiselect: state.get('activities').get('multiselect'),
    starred: thread.get('labels').contains(LabelType.starred.id),
    important: thread.get('labels').contains(LabelType.important.id),
    labels,
    letters,
    header
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onSelectThread: threadId => {
      dispatch(actions.selectThread(threadId));
      ownProps.onClickThreadIdSelected(threadId, ownProps.mailbox);
    },
    onMultiSelect: (threadId, value) => {
      dispatch(actions.multiSelectThread(threadId, value));
    },
    onRemove: () => {
      const threadId = ownProps.thread.get('id');
      dispatch(actions.removeThread(threadId));
    },
    onStarClick: () => {
      const thread = ownProps.thread;
      const threadParams = {
        idThread: thread.get('id'),
        threadId: thread.get('threadId')
      }
      if (thread.get('labels').contains(LabelType.starred.id)) {
        dispatch(
          actions.removeThreadLabel(threadParams, LabelType.starred.id)
        );
      } else {
        dispatch(
          actions.addThreadLabel(threadParams, LabelType.starred.id)
        );
      }
    },
    onImportantClick: () => {
      const thread = ownProps.thread;
      const threadParams = {
        idThread: thread.get('id'),
        threadId: thread.get('threadId')
      }
      if (thread.get('labels').contains(LabelType.important.id)) {
        dispatch(
          actions.removeThreadLabel(threadParams, LabelType.important.id)
        );
      } else {
        dispatch(
          actions.addThreadLabel(threadParams, LabelType.important.id)
        );
      }
    }
  };
};

const ThreadItem = connect(mapStateToProps, mapDispatchToProps)(
  ThreadItemWrapper
);

export default ThreadItem;
